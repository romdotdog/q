import Block from "./Block"
import { IdentifierManager } from "./identManager"
import { GenericToken, NamedGenericSyntax } from "./types/GenericAST"

export function buildParser(
	root: Block
): (tokenStream: GenericToken[]) => NamedGenericSyntax {
	const identManager = new IdentifierManager(Object.keys(root.lex.tokens))
	const rootSyntax: NamedGenericSyntax = {
		type: "Root",
		source: [],
		groups: []
	}

	for (const [name, pattern] of Object.entries(root.parse.ast)) {
		identManager.add(name, pattern)
	}

	return (tokenStream: GenericToken[]) => {
		if (root.parse.root.try(tokenStream, identManager, rootSyntax)) {
			return rootSyntax
		}
		throw new Error("Unable to parse.")
	}
}
