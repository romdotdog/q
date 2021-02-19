import { Token, TokenType } from "./types/Token"

export function lex(input: string): Token[] {
	input = input.replace(/\r\n/g, "\n")

	let p = 0

	let line = 0
	let col = 0

	const tokenBuffer: Token[] = []
	const length = input.length

	function panic(msg: string): never {
		const text = input.substring(0, p)
		console.log(tokenBuffer)
		throw new Error(`file<${line}:${col}>: ${msg}`)
	}

	type TokenCallback = (match: RegExpMatchArray) => Token
	const callbacks: [RegExp, TokenCallback][] = []
	const registerToken = (regex: RegExp, callback: TokenCallback) =>
		callbacks.push([new RegExp(`^(?:${regex.source})`, regex.flags), callback])

	// Identifier with colon
	registerToken(/([a-zA-Z_]\w*):/, ([, value]) => {
		return {
			type: TokenType.Field,
			debugInfo: [line, col],
			value
		}
	})

	// Identifier that references a child
	registerToken(/\$([a-zA-Z_]\w*)/, ([, value]) => {
		return {
			type: TokenType.NestedIdentifier,
			debugInfo: [line, col],
			value
		}
	})

	// Identifier
	registerToken(/[a-zA-Z_]\w*/, ([value]) => {
		return {
			type: TokenType.Identifier,
			debugInfo: [line, col],
			value
		}
	})

	// Note: /(?<!\\)(?:\\\\)*(?!\\)/ matches an even number of backslashes
	registerToken(
		/\/(.*?(?<!\\)(?:\\\\)*(?!\\))\/([gmiyus]*)/,
		([, source, flags]) => {
			return {
				type: TokenType.RegEx,
				debugInfo: [line, col],
				source,
				flags
			}
		}
	)

	registerToken(/"(.*?(?<!\\)(?:\\\\)*(?!\\))"/, ([, value]) => {
		return {
			type: TokenType.String,
			debugInfo: [line, col],
			value
		}
	})

	registerToken(/\[\s*(.*?(?<!\\)(?:\\\\)*(?!\\))\]/, ([, value]) => {
		return {
			type: TokenType.Error,
			debugInfo: [line, col],
			value: value.trim()
		}
	})

	// Symbols

	registerToken(/;/, () => {
		return {
			type: TokenType.Semicolon,
			debugInfo: [line, col]
		}
	})

	registerToken(/\*/, () => {
		return {
			type: TokenType.Asterisk,
			debugInfo: [line, col]
		}
	})

	registerToken(/\+/, () => {
		return {
			type: TokenType.Plus,
			debugInfo: [line, col]
		}
	})

	registerToken(/\|/, () => {
		return {
			type: TokenType.Or,
			debugInfo: [line, col]
		}
	})

	registerToken(/{/, () => {
		return {
			type: TokenType.OpenBrace,
			debugInfo: [line, col]
		}
	})

	registerToken(/}/, () => {
		return {
			type: TokenType.CloseBrace,
			debugInfo: [line, col]
		}
	})

	registerToken(/\(/, () => {
		return {
			type: TokenType.OpenParen,
			debugInfo: [line, col]
		}
	})

	registerToken(/\)/, () => {
		return {
			type: TokenType.CloseParen,
			debugInfo: [line, col]
		}
	})

	function getToken(): Token | never {
		const nextChars = input.substring(p)
		for (const [regex, callback] of callbacks) {
			const m = nextChars.match(regex)
			if (m) {
				const whiteLength = m[0].length
				const lastNewlineIndex = m[0].lastIndexOf("\n")

				if (lastNewlineIndex) {
					line += m[0].split("\n").length - 1
					col = lastNewlineIndex
				} else {
					col += whiteLength
				}

				p += whiteLength
				return callback(m)
			}
		}

		panic(
			"trlex -> Unexpected token. Next 10 characters: " +
				`\`${input.substring(p, p + 10).replace(/\n/g, "\\n")}\``
		)
	}

	while (p < length) {
		// Following regex includes whitespace and // comments
		const leadingWhitespace = input
			.substring(p)
			.match(/^(?:\s*(?:\/\/.*?(?:\n|$))*)*/)

		if (leadingWhitespace) {
			p += leadingWhitespace[0].length
		}

		tokenBuffer.push(getToken())
	}

	return tokenBuffer
}
