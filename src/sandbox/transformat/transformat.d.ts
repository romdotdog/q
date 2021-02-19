declare module "transformat" {
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
		main: Pattern

		/**
		 * AST specification.
		 */
		ast: Record<string, Pattern>
	}

	export default interface Block {
		lex: Lexer
		parse: Parser
	}

	export function pattern(
		literals: TemplateStringsArray,
		...placeholders: string[]
	): Pattern

	export class Pattern {}

	export class IdentifierLiteral extends Pattern {
		value: string

		constructor(tk: Token) {
			super()
			this.value = tk.source
		}
	}

	export class Parenthesis extends Pattern {
		constructor(
			public expr: Pattern,
			public range: [start: number, end?: number]
		) {
			super()
		}
	}

	export class BinOp extends Pattern {
		constructor(public lhs: Pattern, public op: string, public rhs: Pattern) {
			super()
		}
	}
}
