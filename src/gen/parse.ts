import Block from "./Block"
import { IdentifierManager } from "./identManager"
import { GenericSyntax, GenericToken } from "./types/GenericAST"

export function buildParser(
	root: Block
): (tokenStream: GenericToken[]) => GenericSyntax {
	const identManager = new IdentifierManager(Object.keys(root.lex.tokens))

	for (const [name, pattern] of Object.entries(root.parse.ast)) {
		identManager.add(name, pattern)
	}

	return (tokenStream: GenericToken[]) => {
		const rootSyntax: GenericSyntax = {
			groups: [],
			source: []
		}

		if (root.parse.root.try(tokenStream, identManager, rootSyntax)) {
			return rootSyntax
		}
		throw new Error("Unable to parse.")
	}
}
