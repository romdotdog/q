import { IdentifierManager } from "../gen/identManager"
import {
	GenericSyntax,
	GenericToken,
	NamedGenericSyntax
} from "../gen/types/GenericAST"

export enum TokenType {
	Identifier,
	Op,
	OpenParen,
	CloseParen,
	OpenAngleBracket,
	CloseAngleBracket
}

export interface Token {
	type: TokenType
	source: string
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

	constructor(tk: Token) {
		super()
		this.value = tk.source
	}

	print(): string {
		return this.value
	}

	try(
		tokenStream: GenericToken[],
		identManager: IdentifierManager,
		syntax: GenericSyntax
	): boolean {
		if (identManager.isLex(this.value)) {
			const [next] = tokenStream.splice(0, 1)
			if (next && next.type == this.value) {
				syntax.source.push(next)
				return true
			}
			return false
		} else {
			const pattern = identManager.get(this.value)
			if (pattern) {
				const namedSyntax: NamedGenericSyntax = {
					type: this.value,
					groups: [],
					source: []
				}

				const success = pattern.try(tokenStream, identManager, namedSyntax)
				if (success) {
					syntax.groups.push(namedSyntax)
					return true
				}
				return false
			} else {
				throw new Error(`Identifier \`${this.value}\` not found.`)
			}
		}
	}
}

const makeNullToEnd = (start: number, groups: (GenericSyntax | null)[]) => {
	const numberToNullize = groups.length - start
	groups.splice(
		start,
		numberToNullize,
		...(Array(numberToNullize).fill(null) as null[])
	)
}

export class Parenthesis extends Pattern {
	constructor(
		public expr: Pattern,
		public range: [start: number, end?: number]
	) {
		super()
	}

	print(): string {
		return `(${this.expr.print()})`
	}

	try(
		tokenStream: GenericToken[],
		identManager: IdentifierManager,
		syntax: GenericSyntax
	): boolean {
		const [start, end] = this.range

		// Try greedily
		let newStream = tokenStream
		let successfulTries = 0
		while (!end || successfulTries < end) {
			const experimentalStream = newStream.slice()
			const start = syntax.groups.length
			if (this.expr.try(experimentalStream, identManager, syntax)) {
				newStream = experimentalStream
				successfulTries++
			} else {
				makeNullToEnd(start, syntax.groups)
				break
			}
		}

		// switch streams in-place (hack)
		tokenStream.splice(0, tokenStream.length, ...newStream)
		return successfulTries >= start
	}
}

export class Group extends Pattern {
	constructor(public expr: Pattern) {
		super()
	}

	print(): string {
		return `<${this.expr.print()}>`
	}

	try(
		tokenStream: GenericToken[],
		identManager: IdentifierManager,
		syntax: GenericSyntax
	): boolean {
		const nestedSyntax: GenericSyntax = {
			groups: [],
			source: []
		}

		const success = this.expr.try(tokenStream, identManager, nestedSyntax)
		if (success) {
			syntax.groups.push(nestedSyntax)
			return true
		}
		syntax.groups.push(null)
		return false
	}
}

export class BinOp extends Pattern {
	constructor(public lhs: Pattern, public op: string, public rhs: Pattern) {
		super()
	}

	print(): string {
		return `${this.lhs.print()} ${this.op} ${this.rhs.print()}`
	}

	try(
		tokenStream: GenericToken[],
		identManager: IdentifierManager,
		syntax: GenericSyntax
	): boolean {
		switch (this.op) {
			case "->": // fails if either side fails
				return (
					this.lhs.try(tokenStream, identManager, syntax) &&
					this.rhs.try(tokenStream, identManager, syntax)
				)
			case "|": {
				// tries both on separate token streams, tries the one that succeeds
				let newStream: GenericToken[]
				const lhsStream = tokenStream.slice()
				const rhsStream = tokenStream.slice()

				// Switch the added groups to null if lhs or rhs fails
				let start = syntax.groups.length

				if (this.lhs.try(lhsStream, identManager, syntax)) {
					newStream = lhsStream
				} else {
					makeNullToEnd(start, syntax.groups)
					start = syntax.groups.length
					if (this.rhs.try(rhsStream, identManager, syntax)) {
						newStream = rhsStream
					} else {
						makeNullToEnd(start, syntax.groups)
						return false
					}
				}

				// switch streams in-place (hack)
				tokenStream.splice(0, tokenStream.length, ...newStream)
				return true
			}
			default:
				throw new Error(`Unexpected operator \`${this.op}\``)
		}
	}
}
