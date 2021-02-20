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
