import { cac } from "cac"
import { readFile } from "fs/promises"
import { buildLex as buildLexer } from "./gen/lex"
import requireFromString from "require-from-string"
import { buildParser } from "./gen/parse"
import { buildGenerator } from "./gen/generate"
import { compile } from "./compiler"
import iconv from "iconv-lite"

// https://stackoverflow.com/questions/30441025/read-all-text-from-stdin-to-a-string
async function read(stream: NodeJS.ReadStream) {
	const chunks = []
	for await (const chunk of stream) chunks.push(chunk)
	return Buffer.concat(chunks).toString("utf8")
}

const cli = cac("q")
cli
	.command("<q> [file]", "transform [file] using <q>")
	.action(async (q: string, file: string) => {
		const Block = requireFromString(await compile(q))

		if (!Block.default)
			throw new Error("Expected `Block` as default export in q.")

		const str = iconv.decode(
			await readFile(file),
			Block.default?.lex?.encoding || "utf8"
		)

		const tokenStream = buildLexer(Block.default)(str)
		const ast = buildParser(Block.default)(tokenStream)
		console.log(buildGenerator(Block.default)(ast))
	})

cli.parse()
