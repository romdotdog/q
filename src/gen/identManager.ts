import { Pattern } from "../pattern/AST"

export class IdentifierManager {
	private lexIdents: Set<string>
	private idents: Record<string, Pattern> = {}

	constructor(lexIdents: string[]) {
		this.lexIdents = new Set(lexIdents)
	}

	isLex(ident: string): boolean {
		return this.lexIdents.has(ident)
	}

	add(ident: string, pattern: Pattern): void {
		this.idents[ident] = pattern
	}

	get(ident: string): Pattern | undefined {
		return this.idents[ident]
	}
}
