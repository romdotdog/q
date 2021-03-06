import { Pattern } from "../pattern/AST"
import { GenericSyntax, SerializedGenericSyntax } from "./types/GenericAST"

/**
 * This interface provides a specification to tokenize text.
 */
interface Lexer {
	/**
	 * Greedily consumes this regex before every token.
	 */
	whitespaceRegEx?: RegExp

	/**
	 * An optional iconv encoding to decode with.
	 */
	encoding?: string

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

type Visitor = (groups: GenericSyntax) => void
type Serializer = (groups: SerializedGenericSyntax) => string

interface Generator {
	syntaxes: Record<
		string,
		{
			visit?: Visitor
			serialize?: Serializer
		}
	>
	$joiner?: (accumulator: string, serializedSyntax: string) => string
}

export default interface Block {
	lex: Lexer
	parse: Parser
	gen: Generator
}
