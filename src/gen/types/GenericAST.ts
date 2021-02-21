export interface GenericToken {
	type: string
	source: [string, ...string[]]
	debugInfo: [line: number, col: number]
}

export interface GenericSyntax {
	type?: string
	source: GenericToken[]
	groups: (GenericSyntax | null)[]
}

export interface NamedGenericSyntax extends GenericSyntax {
	type: string
}

export interface SerializedGenericSyntax extends Omit<GenericSyntax, "groups"> {
	groups: (string | null)[]
}
