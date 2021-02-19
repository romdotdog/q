import { TokenType, TokenLiteral, TokenRegEx } from "./Token"
import unescape from "unescape-js"

class Base {}

class Expression extends Base {}
class Statement extends Base {}

// This is generally a small AST that can fit into one file

export class StringLiteral extends Expression {
	value: string

	constructor(token: TokenLiteral & { type: TokenType.String }) {
		super()
		this.value = unescape(token.value)
	}
}

export class RegExLiteral extends Expression {
	value: RegExp

	constructor(token: TokenRegEx & { type: TokenType.RegEx }) {
		super()
		this.value = new RegExp(token.source, token.flags)
	}
}

// End Literals

export class Parenthesis extends Expression {
	constructor(
		public expr: Expression,
		public range: [start: number, end?: number]
	) {
		super()
	}
}

export class BinOp extends Expression {
	constructor(public lhs: Expression, public rhs: Expression) {
		super()
	}
}

// End Expressions

export type Block = [Record<string, Node>, Error?]

export class Node extends Statement {
	constructor(public expr: Expression, public block?: Block) {
		super()
	}
}

export class ErrorStat extends Statement {
	value: string

	constructor(token: TokenLiteral & { type: TokenType.Error }) {
		super()
		this.value = unescape(token.value)
	}
}
