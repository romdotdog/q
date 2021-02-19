import { GenericSyntax, NamedGenericSyntax } from "transformat"
import Block from "./Block"

export function buildGenerator(
	root: Block
): (ast: NamedGenericSyntax) => string {
	type MaybeNamedSyntax = GenericSyntax & { type?: string }

	const syntaxes = root.gen.syntaxes

	function traverse(syntax: MaybeNamedSyntax): string {
		const joiner =
			root.gen.$joiner ||
			function (accumulator, serializedSyntax) {
				return accumulator + " " + serializedSyntax
			}

		if (syntax.type) {
			const syntaxVisitor = syntaxes[syntax.type]
			if (!syntaxVisitor) {
				throw new Error(`Expected visitor for ${syntax.type}`)
			}

			if (syntaxVisitor.visit) {
				syntaxVisitor.visit(...syntax.groups)
			}

			const groups = syntax.groups.map(traverse)
			return syntaxVisitor.serialize(...groups)
		}

		return syntax.groups
			.map(traverse)
			.reduce(
				(accumulator, serializedSyntax) =>
					joiner(accumulator, serializedSyntax),
				""
			)
	}

	return (ast: NamedGenericSyntax) => {
		return traverse(ast)
	}
}
