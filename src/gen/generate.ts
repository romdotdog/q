import Block from "./Block"
import { GenericSyntax } from "./types/GenericAST"

export function buildGenerator(root: Block): (ast: GenericSyntax) => string {
	const syntaxes = root.gen.syntaxes

	function traverse(syntax: GenericSyntax): string {
		const joiner =
			root.gen.$joiner ||
			function (accumulator, serializedSyntax) {
				if (accumulator.length == 0) return serializedSyntax
				return accumulator + " " + serializedSyntax
			}

		if (syntax.type) {
			const syntaxVisitor = syntaxes[syntax.type]
			if (syntaxVisitor) {
				if (syntaxVisitor.visit) {
					syntaxVisitor.visit(...syntax.groups)
				}

				if (syntaxVisitor.serialize) {
					const groups = syntax.groups.map((g) => (g ? traverse(g) : g))
					return syntaxVisitor.serialize(...groups)
				}
			}
		}

		return (syntax.groups.length === 0
			? syntax.source.map((t) => t.source[0])
			: syntax.groups.filter((g): g is GenericSyntax => !!g).map(traverse)
		).reduce(joiner, "")
	}

	return (ast: GenericSyntax) => traverse(ast)
}
