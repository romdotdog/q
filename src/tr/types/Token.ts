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

export interface TokenLiteral extends Token {
	value: string
}

export interface TokenRegEx extends Token {
	source: string
	flags: string
}
