import { lex } from "./lex"
import { Block } from "./types/AST"
import { TokenType } from "./types/Token"

export function parse(input: string): Block {
	const tokenStream = lex(input)

	let p = 0

	const get = () => tokenStream[p++]
	const peek = (n = 0) => tokenStream[p + n]

	function panic(msg: string): never {
		const tk = peek()
		const [line, col] = tk.debugInfo
		throw new Error(`trprs -> ${msg}. ${tk.toString()} at <${line}:${col}>`)
	}

	let block

	block = () => {
		let tk
		while ((tk = get()) && tk.type != TokenType.CloseBrace) {}
	}

	block()
}
