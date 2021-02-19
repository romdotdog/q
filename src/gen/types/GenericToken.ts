export interface GenericToken {
	type: string
	source: [string, ...string[]]
	debugInfo: [line: number, col: number]
}
