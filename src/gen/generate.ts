import Block from "./Block"
import { GenericSyntax, SerializedGenericSyntax } from "./types/GenericAST"

export function buildGenerator(root: Block): (ast: GenericSyntax) => string {
	const syntaxes = root.gen.syntaxes

	const getGroupLength = (syntax: GenericSyntax) =>
		syntax.groups.filter((_s): _s is GenericSyntax => !!_s).length

	function simplify(syntax: GenericSyntax): GenericSyntax {
		if (!syntax.type && getGroupLength(syntax) === 1) {
			syntax = syntax.groups.find((s) => s) || syntax
		}

		syntax.groups = syntax.groups.map((g) => g && simplify(g))
		return syntax
	}

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
					syntaxVisitor.visit(syntax)
				}

				if (syntaxVisitor.serialize) {
					const serializedSyntax: SerializedGenericSyntax = {
						type: syntax.type,
						groups: syntax.groups.map((g) => (g ? traverse(g) : g)),
						source: syntax.source
					}

					const override = syntaxVisitor.serialize(serializedSyntax)
					if (override) return override
				}
			}
		}

		return (syntax.groups.length === 0
			? syntax.source.map((t) => t.source[0])
			: syntax.groups.filter((g): g is GenericSyntax => !!g).map(traverse)
		).reduce(joiner, "")
	}

	return (ast: GenericSyntax) => {
		simplify(ast)
		return traverse(ast)
	}
}
