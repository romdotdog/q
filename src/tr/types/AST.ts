import { TokenType, TokenLiteral, TokenRegEx } from "./Token"
import unescape from "unescape-js"

class Base {}

export class Expression extends Base {}
export class Statement extends Base {}

// This is generally a small AST that can fit into one file

export class IdentifierLiteral extends Expression {
	value: string
	nested: boolean

	constructor(token: TokenLiteral) {
		super()

		this.nested = token.type == TokenType.NestedIdentifier
		this.value = token.value
	}
}

export class StringLiteral extends Expression {
	value: string

	constructor(token: TokenLiteral) {
		super()
		this.value = unescape(token.value)
	}
}

export class RegExLiteral extends Expression {
	value: RegExp

	constructor(token: TokenRegEx) {
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
	constructor(
		public lhs: Expression,
		public op: string,
		public rhs: Expression
	) {
		super()
	}
}

// End Expressions

export type Block = [[string, Node][], ErrorStat?]

export class Node extends Statement {
	constructor(public expr: Expression, public block?: Block) {
		super()
	}
}

export class ErrorStat extends Statement {
	value: string

	constructor(token: TokenLiteral) {
		super()
		this.value = unescape(token.value)
	}
}
