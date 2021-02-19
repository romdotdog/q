type OneOrMore<T> = [T, ...T[]]

export interface GenericToken {
	type: string
	source: OneOrMore<string>
	debugInfo: [line: number, col: number]
}

export interface GenericSyntax {
	source: GenericToken[]
	groups: GenericSyntax[]
}

export interface NamedGenericSyntax extends GenericSyntax {
	type: string
}
