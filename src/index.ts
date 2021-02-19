import { cac } from "cac"
import { readFile } from "fs/promises"
import { buildLex } from "./gen/lex"
import { parse } from "./tr/parse"

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
		const root = parse(await readFile(transformat, { encoding: "utf-8" }))

		const str = file
			? await readFile(file, { encoding: "utf8" })
			: await read(process.stdin)

		console.log(buildLex(root)(str))
	})

cli.parse()
