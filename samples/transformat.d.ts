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
		root: Pattern

		/**
		 * AST specification.
		 */
		ast: Record<string, Pattern>
	}

	type Visitor = (...groups: GenericSyntax[]) => void
	type Serializer = (...groups: string[]) => string

	interface Generator {
		syntaxes: Record<
			string,
			{
				visit?: Visitor
				serialize: Serializer
			}
		>
		$joiner?: (accumulator: string, serializedSyntax: string) => string
	}

	export default interface Block {
		lex: Lexer
		parse: Parser
		gen: Generator
	}

	export function q(
		literals: TemplateStringsArray,
		...placeholders: string[]
	): Pattern

	export class IdentifierManager {
		private lexIdents: Set<string>
		private idents: Record<string, Pattern> = {}

		constructor(lexIdents: string[])

		isLex(ident: string): boolean
		add(ident: string, pattern: Pattern): void
		get(ident: string): Pattern | undefined
	}

	export interface GenericToken {
		type: string
		source: [string, ...string[]]
		debugInfo: [line: number, col: number]
	}

	export interface GenericSyntax {
		source: GenericToken[]
		groups: GenericSyntax[]
	}

	export interface NamedGenericSyntax extends GenericSyntax {
		type: string
	}

	export abstract class Pattern {
		abstract try(
			tokenStream: GenericToken[],
			identManager: IdentifierManager,
			syntax: GenericSyntax
		): boolean

		abstract print(): string
	}

	export class IdentifierLiteral extends Pattern {
		value: string

		constructor(tk: Token)
	}

	export class Parenthesis extends Pattern {
		constructor(
			public expr: Pattern,
			public range: [start: number, end?: number]
		)
	}

	export class BinOp extends Pattern {
		constructor(public lhs: Pattern, public op: string, public rhs: Pattern)
	}
}
