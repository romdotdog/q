import { cac } from "cac"
import { readFile } from "fs/promises"
import { buildLex as buildLexer } from "./gen/lex"
import { join } from "path"
import requireFromString from "require-from-string"
import * as ts from "typescript"
import { buildParser } from "./gen/parse"
import { buildGenerator } from "./gen/generate"

// https://stackoverflow.com/questions/30441025/read-all-text-from-stdin-to-a-string
async function read(stream: NodeJS.ReadStream) {
	const chunks = []
	for await (const chunk of stream) chunks.push(chunk)
	return Buffer.concat(chunks).toString("utf8")
}

const cli = cac("q")
cli
	.command("<q> [file]", "transform [file] or stdin using <q>")
	.action(async (q: string, file?: string) => {
		const Block = requireFromString(
			ts.transpile(await readFile(q, { encoding: "utf-8" })),
			q,
			{
				prependPaths: [join(__dirname, "sandbox")]
			}
		)

		if (!Block.default)
			throw new Error("Expected `Block` as default export in q.")

		const str = file
			? await readFile(file, { encoding: "utf8" })
			: await read(process.stdin)

		const tokenStream = buildLexer(Block.default)(str)
		const ast = buildParser(Block.default)(tokenStream)
		console.log(buildGenerator(Block.default)(ast))
	})

cli.parse()
