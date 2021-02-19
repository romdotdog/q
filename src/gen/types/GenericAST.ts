export interface GenericToken {
	type: string
	source: [string, ...string[]]
	debugInfo: [line: number, col: number]
}

export interface GenericSyntax {
	source: (GenericToken | GenericSyntax)[]
	groups: GenericSyntax[]
}

export interface NamedGenericSyntax extends GenericSyntax {
	type: string
}
