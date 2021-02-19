import Block from "transformat"
import { GenericToken } from "./types/GenericAST"

function escapeRegExp(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // $& means the whole matched string
}

export function buildLex(root: Block): (input: string) => GenericToken[] {
	const lex = root.lex
	const whitespaceRegEx = lex.whitespaceRegEx

	const tokenTypes: [name: string, matcher: RegExp][] = []
	for (const _name of Reflect.ownKeys(lex.tokens)) {
		// integer names throw off chronological object ordering
		const name = _name.toString()
		if (!isNaN(parseInt(name.toString()))) {
			throw new Error(
				`Integer name \`${name.toString()}\` in lexer is not allowed.`
			)
		}

		const expr = lex.tokens[name]
		if (expr instanceof RegExp) {
			tokenTypes.push([name, new RegExp(`^(?:${expr.source})`, expr.flags)])
		} else if (typeof expr === "string") {
			tokenTypes.push([name, new RegExp(`^(?:${escapeRegExp(expr)})`)])
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

					const [m0, ...rm] = [...m]
					const r: GenericToken = {
						type: name,
						source: [m0, ...rm],
						debugInfo: [line, col]
					}
					col += l
					return r
				}
			}

			panic(
				`${
					lex.throw || "built lexer => Unexpected token."
				} Next 10 characters: ` +
					`\`${input.substring(p, p + 10).replace(/\n/g, "\\n")}\``
			)
		}

		while (p < length) {
			if (whitespaceRegEx) {
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
			}

			const tk = getToken()
			if (tk.source[0] == "") {
				throw new Error(
					`built lexer => Encountered infinite regex loop at \`${tk.type}\``
				)
			}
			tokenBuffer.push(tk)
		}

		return tokenBuffer
	}
}
