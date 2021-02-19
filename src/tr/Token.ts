export enum TokenType {
	Field,
	NestedIdentifier,
	Identifier,

	RegEx,
	String,
	Error,

	Asterisk,
	Plus,

	Or,

	Semicolon,

	OpenBrace,
	CloseBrace,

	OpenParen,
	CloseParen
}

export interface Token {
	type: TokenType
}

export interface VariableToken extends Token {
	value: string
}
