import { GenericToken } from "./types/GenericToken"
import { Block, RegExLiteral, StringLiteral } from "../tr/types/AST"

function escapeRegExp(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // $& means the whole matched string
}

export function buildLex(root: Block): (input: string) => GenericToken[] {
	const _lex = root[0].find(([field]) => field == "lex")
	if (!_lex) {
		throw new Error("Expected `lex` field in root block.")
	}

	const [, lex] = _lex

	const whitespaceExpr = lex.expr
	if (!(whitespaceExpr instanceof RegExLiteral)) {
		throw new Error("Expected `lex` field expression to be a RegEx.")
	}

	if (!lex.block) {
		throw new Error("Expected `lex` field to have a block.")
	}

	const whitespaceRegEx = whitespaceExpr.value

	const tokenTypes: [name: string, matcher: RegExp][] = []
	for (const [name, { expr }] of lex.block[0]) {
		if (expr instanceof RegExLiteral) {
			const { value } = expr
			tokenTypes.push([name, new RegExp(`^(?:${value.source})`, value.flags)])
		} else if (expr instanceof StringLiteral) {
			tokenTypes.push([name, new RegExp(`^(?:${escapeRegExp(expr.value)})`)])
		} else {
			throw new Error(
				`Invalid expression for lexer in field \`${name}\`, expected RegEx or String.`
			)
		}
	}

	return (input: string) => {
		input = input.replace(/\r\n/g, "\n")

		let p = 0

		let line = 1
		let col = 0

		const tokenBuffer: GenericToken[] = []
		const length = input.length

		function panic(msg: string): never {
			console.log(tokenBuffer)
			throw new Error(`file<${line}:${col}>: ${msg}`)
		}

		function getToken(): GenericToken | never {
			const nextChars = input.substring(p)
			for (const [name, matcher] of tokenTypes) {
				const m = nextChars.match(matcher)
				if (m) {
					const l = m[0].length
					p += l

					const r: GenericToken = {
						type: name,
						source: m[0],
						debugInfo: [line, col]
					}
					col += l
					return r
				}
			}

			panic(
				`${
					lex.block?.[1]?.value || "built lexer => Unexpected token."
				} Next 10 characters: ` +
					`\`${input.substring(p, p + 10).replace(/\n/g, "\\n")}\``
			)
		}

		while (p < length) {
			const leadingWhitespace = input.substring(p).match(whitespaceRegEx)

			if (leadingWhitespace) {
				const whiteLength = leadingWhitespace[0].length
				const lastNewlineIndex = leadingWhitespace[0].lastIndexOf("\n")

				if (lastNewlineIndex != -1) {
					line += leadingWhitespace[0].split("\n").length - 1
					col = whiteLength - lastNewlineIndex
				} else {
					col += whiteLength
				}

				p += whiteLength
			}

			const tk = getToken()
			if (tk.source == "") {
				throw new Error(
					`built lexer => Encountered infinite regex loop at \`${tk.type}\``
				)
			}
			tokenBuffer.push(tk)
		}

		return tokenBuffer
	}
}
