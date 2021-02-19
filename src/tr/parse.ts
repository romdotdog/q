import { lex } from "./lex"
import {
	BinOp,
	Block,
	Expression,
	IdentifierLiteral,
	Node,
	Parenthesis,
	RegExLiteral,
	StringLiteral
} from "./types/AST"
import { TokenLiteral, TokenRegEx, TokenType } from "./types/Token"

const BinOpPriority: Record<string, number> = {
	"+": 0,
	"|": 1
}

export function parse(input: string): Block {
	const tokenStream = lex(input)

	let p = 0

	const get = () => tokenStream[p++]
	const peek = (n = 0) => tokenStream[p + n]

	function panic(msg: string): never {
		const tk = peek()
		const [line, col] = tk.debugInfo
		throw new Error(`trprs -> ${msg}. ${tk.toString()} at <${line}:${col}>`)
	}

	// eslint-disable-next-line prefer-const
	let block: () => Block, expr: () => Expression

	type PrimaryExpression =
		| IdentifierLiteral
		| StringLiteral
		| RegExLiteral
		| Parenthesis
	function primaryExpr(): PrimaryExpression {
		const tk = get()
		switch (tk.type) {
			case TokenType.Identifier:
			case TokenType.NestedIdentifier:
				return new IdentifierLiteral(tk as TokenLiteral)
			case TokenType.String:
				return new StringLiteral(tk as TokenLiteral)
			case TokenType.RegEx:
				return new RegExLiteral(tk as TokenRegEx)
			case TokenType.OpenParen: {
				const e = expr()
				p++

				let range: [number, number?] = [1, 1]
				if (peek().type == TokenType.Asterisk) {
					p++
					range = [0]
				}

				return new Parenthesis(e, range)
			}
			default:
				panic("Expected primary expression.")
		}
	}

	function subExpr(lhs: Expression, precedence: number): Expression {
		let lookahead, lookaheadPrecedence
		while (
			(lookahead = peek() as TokenLiteral) &&
			(lookaheadPrecedence = BinOpPriority[lookahead.value]) &&
			lookaheadPrecedence >= precedence
		) {
			p++
			let rhs: Expression = primaryExpr()

			let lookahead2, lookahead2Precedence
			while (
				(lookahead2 = peek() as TokenLiteral) &&
				(lookahead2Precedence = BinOpPriority[lookahead2.value]) &&
				lookahead2Precedence > lookaheadPrecedence
			) {
				rhs = subExpr(rhs, lookahead2Precedence)
			}

			lhs = new BinOp(lhs, lookahead.value, rhs)
		}
		return lhs
	}

	expr = (): Expression => {
		return subExpr(primaryExpr(), 0)
	}

	function getNode(): Node {
		const e = expr()

		let b: Block | undefined
		if (peek().type == TokenType.OpenBrace) {
			p++
			b = block()
		}

		return new Node(e, b)
	}

	block = (): Block => {
		const res: Block = [[]]

		let tk
		while ((tk = get() as TokenLiteral) && tk.type != TokenType.CloseBrace) {
			switch (tk.type) {
				case TokenType.Field:
					res[0].push([tk.value, getNode()])
					break
				case TokenType.Error:
					res[1] = tk
					break
			}
		}

		return res
	}

	return block()
}
