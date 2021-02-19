import { Token, TokenType } from "./types/Token"

export function lex(input: string): Token[] {
	input = input.replace(/\r\n/g, "\n")

	let p = 0
	const tokenBuffer: Token[] = []
	const length = input.length

	function panic(msg: string): never {
		const text = input.substring(0, p)
		const line = text.split("\n").length
		let char = p
		text.split("\n").forEach((s) => (char -= s.length))
		console.log(tokenBuffer)
		throw new Error(`file<${line}:${char}>: ${msg}`)
	}

	type TokenCallback = (match: RegExpMatchArray) => Token
	const callbacks: [RegExp, TokenCallback][] = []
	const registerToken = (regex: RegExp, callback: TokenCallback) =>
		callbacks.push([new RegExp(`^(?:${regex.source})`, regex.flags), callback])

	// Identifier with colon
	registerToken(/([a-zA-Z_]\w*):/, ([, value]) => {
		return {
			type: TokenType.Field,
			value
		}
	})

	// Identifier that references a child
	registerToken(/\$([a-zA-Z_]\w*)/, ([, value]) => {
		return {
			type: TokenType.NestedIdentifier,
			value
		}
	})

	// Identifier
	registerToken(/[a-zA-Z_]\w*/, ([value]) => {
		return {
			type: TokenType.Identifier,
			value
		}
	})

	// Note: /(?<!\\)(?:\\\\)*(?!\\)/ matches an even number of backslashes
	registerToken(
		/\/(.*?(?<!\\)(?:\\\\)*(?!\\))\/([gmiyus]*)/,
		([, source, flags]) => {
			return {
				type: TokenType.RegEx,
				source,
				flags
			}
		}
	)

	registerToken(/"(.*?(?<!\\)(?:\\\\)*(?!\\))"/, ([, value]) => {
		return {
			type: TokenType.String,
			value
		}
	})

	registerToken(/\[\s*(.*?(?<!\\)(?:\\\\)*(?!\\))\]/, ([, value]) => {
		return {
			type: TokenType.Error,
			value: value.trim()
		}
	})

	// Symbols

	registerToken(/;/, () => {
		return {
			type: TokenType.Semicolon
		}
	})

	registerToken(/\*/, () => {
		return {
			type: TokenType.Asterisk
		}
	})

	registerToken(/\+/, () => {
		return {
			type: TokenType.Plus
		}
	})

	registerToken(/\|/, () => {
		return {
			type: TokenType.Or
		}
	})

	registerToken(/{/, () => {
		return {
			type: TokenType.OpenBrace
		}
	})

	registerToken(/}/, () => {
		return {
			type: TokenType.CloseBrace
		}
	})

	registerToken(/\(/, () => {
		return {
			type: TokenType.OpenParen
		}
	})

	registerToken(/\)/, () => {
		return {
			type: TokenType.CloseParen
		}
	})

	function getToken(): Token | never {
		const nextChars = input.substring(p)
		for (const [regex, callback] of callbacks) {
			const m = nextChars.match(regex)
			if (m) {
				p += m[0].length
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
