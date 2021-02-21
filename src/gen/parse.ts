import Block from "./Block"
import { IdentifierManager } from "./identManager"
import { NamedGenericSyntax, GenericToken } from "./types/GenericAST"

export function buildParser(
	root: Block
): (tokenStream: GenericToken[]) => NamedGenericSyntax {
	const identManager = new IdentifierManager(Object.keys(root.lex.tokens))

	for (const [name, pattern] of Object.entries(root.parse.ast)) {
		identManager.add(name, pattern)
	}

	return (tokenStream: GenericToken[]) => {
		const rootSyntax: NamedGenericSyntax = {
			type: "root",
			groups: [],
			source: []
		}

		if (root.parse.root.try(tokenStream, identManager, rootSyntax)) {
			return rootSyntax
		}

		throw new Error(
			`Unable to parse. Next 10 tokens: ${tokenStream
				.slice(0, 10)
				.map((t) => `${t.type}<${t.source[0]}>`)}`
		)
	}
}
