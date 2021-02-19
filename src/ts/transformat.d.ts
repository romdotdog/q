declare module "transformat" {
	/**
	 * This interface provides a specification to tokenize text.
	 */
	interface Lexer {
		/**
		 * Greedily consumes this regex before every token.
		 */
		whitespaceRegEx?: RegExp

		tokens: [name: string, matcher: RegExp | string | undefined][]

		/**
		 * Throws an error with this string if the lexer cannot tokenize
		 */
		throw?: string
		[key: string]: never
	}

	export default interface Block {
		lex: Lexer
	}
}
