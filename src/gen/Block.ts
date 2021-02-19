import { Pattern } from "../pattern/AST"

/**
 * This interface provides a specification to tokenize text.
 */
interface Lexer {
	/**
	 * Greedily consumes this regex before every token.
	 */
	whitespaceRegEx?: RegExp

	/**
	 * Throws an error with this string if the lexer cannot tokenize
	 */
	throw?: string

	/**
	 * Tokenization specification.
	 */
	tokens: Record<string, RegExp | string>
}

/**
 * A string in the tr pattern format.
 */
interface Parser {
	/**
	 * The main pattern the entire file consists of.
	 */
	root: Pattern

	/**
	 * AST specification.
	 */
	ast: Record<string, Pattern>
}

export default interface Block {
	lex: Lexer
	parse: Parser
}
