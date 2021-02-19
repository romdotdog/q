import { cac } from "cac"
import { readFile } from "fs/promises"
import { buildLex } from "./gen/lex"
import { join } from "path"
import requireFromString from "require-from-string"
import * as ts from "typescript"

// https://stackoverflow.com/questions/30441025/read-all-text-from-stdin-to-a-string
async function read(stream: NodeJS.ReadStream) {
	const chunks = []
	for await (const chunk of stream) chunks.push(chunk)
	return Buffer.concat(chunks).toString("utf8")
}

const cli = cac("transformat")
cli
	.command(
		"<transformat> [file]",
		"transform [file] or stdin using <transformat>"
	)
	.action(async (transformat: string, file?: string) => {
		const Block = requireFromString(
			ts.transpile(await readFile(transformat, { encoding: "utf-8" })),
			transformat,
			{
				prependPaths: [join(__dirname, "sandbox")]
			}
		)

		console.assert(
			Block.default,
			"Expected `Block` as default export in transformat."
		)

		console.log(file)

		const str = file
			? await readFile(file, { encoding: "utf8" })
			: await read(process.stdin)

		console.log(buildLex(Block.default)(str))
	})

cli.parse()
