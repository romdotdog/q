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

		let serializedSyntax: SerializedGenericSyntax | undefined = undefined
		if (syntax.type) {
			const syntaxVisitor = syntaxes[syntax.type]
			if (syntaxVisitor) {
				if (syntaxVisitor.visit) {
					try {
						syntaxVisitor.visit(syntax)
					} catch (e) {
						console.log(`Error while visiting ${syntax.type}`)
						throw e
					}
				}

				if (syntaxVisitor.serialize) {
					serializedSyntax = {
						type: syntax.type,
						groups: syntax.groups.map((g) => (g ? traverse(g) : g)),
						source: syntax.source
					}

					try {
						const override = syntaxVisitor.serialize(serializedSyntax)
						if (override) return override
					} catch (e) {
						console.log(`Error while serializing ${syntax.type}`)
						throw e
					}
				}
			}
		}

		return (syntax.groups.length === 0 // if this doesn't have child groups,
			? syntax.source.map((t) => t.source[0]) // use the token.
			: serializedSyntax // else if this was already serialized
			? serializedSyntax.groups.filter((g): g is string => !!g) // use the serialized syntax
			: syntax.groups.filter((g): g is GenericSyntax => !!g).map(traverse)
		) // otherwise serialize the current group
			.reduce(joiner, "")
	}

	return (ast: GenericSyntax) => {
		simplify(ast)
		return traverse(ast)
	}
}
