import {
	BinOp,
	Group,
	IdentifierLiteral,
	Parenthesis,
	Pattern,
	Token,
	TokenType
} from "./AST"

const BinOpPriority: Record<string, number> = {
	"->": 2,
	"|": 1
}

function buildLexer(...matchers: RegExp[]): RegExp {
	const builder = matchers.map((m) => m.source).join("|")
	return new RegExp(`\\s*(?:${builder})`, "gy")
}

function parse(input: string): Pattern {
	// mini lexer
	const tokenStream = [
		...input.matchAll(
			buildLexer(
				/([a-zA-Z_]\w*)/, // Identifier
				/(->|\|)/, // Op
				/(\()/, // OpenParenthesis
				/(\)[+*?]?)/, // CloseParenthesis with modifiers
				/(<)/, // OpenAngleBracket
				/(>)/ // CloseAngleBracket
			)
		)
	]
		.map((t) => {
			// find first group which isn't undefined
			const index = [...t].slice(1).findIndex((t) => t)
			return index !== -1
				? {
						type: index,
						source: t[index + 1]
				  }
				: undefined
		})
		.filter((n): n is Token => !!n)

	let p = 0

	const get = () => tokenStream[p++]
	const peek = (n = 0) => tokenStream[p + n]

	function panic(msg: string): never {
		throw new Error(`ptprs \`${input}\` -> ${msg}.`)
	}

	// eslint-disable-next-line prefer-const
	let expr: () => Pattern

	type PrimaryExpression = IdentifierLiteral | Parenthesis | Group

	function primaryExpr(): PrimaryExpression {
		const tk = get()
		switch (tk.type) {
			case TokenType.Identifier:
				return new IdentifierLiteral(tk)
			case TokenType.OpenParen: {
				const e = expr()
				const closeParen = get()

				if (closeParen.type !== TokenType.CloseParen) {
					panic(`Expected closing parenthesis, got ${closeParen.source}`)
				}

				let range: [number, number?] = [1, 1]

				switch (closeParen.source.substring(1)) {
					case "*":
						range = [0]
						break
					case "+":
						range = [1]
						break
					case "?":
						range = [0, 1]
						break
				}

				return new Parenthesis(e, range)
			}
			case TokenType.OpenAngleBracket: {
				const e = expr()
				p++
				return new Group(e)
			}
			default:
				panic("Expected primary expression.")
		}
	}

	function subExpr(lhs: Pattern, precedence: number): Pattern {
		let lookahead, lookaheadPrecedence
		while (
			(lookahead = peek()) &&
			(lookaheadPrecedence = BinOpPriority[lookahead.source]) &&
			lookaheadPrecedence >= precedence
		) {
			p++
			let rhs: Pattern = primaryExpr()

			let lookahead2, lookahead2Precedence
			while (
				(lookahead2 = peek()) &&
				(lookahead2Precedence = BinOpPriority[lookahead2.source]) &&
				lookahead2Precedence > lookaheadPrecedence
			) {
				rhs = subExpr(rhs, lookahead2Precedence)
			}

			lhs = new BinOp(lhs, lookahead.source, rhs)
		}

		return lhs
	}

	expr = (): Pattern => {
		return subExpr(primaryExpr(), 0)
	}

	return expr()
}

export function pattern(
	literals: TemplateStringsArray,
	...placeholders: string[]
): Pattern {
	let res = ""
	literals.forEach((l, i) => {
		res += l + (placeholders[i] || "")
	})

	return parse(res)
}
