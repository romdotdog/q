import { cac } from "cac"
import { readFile } from "fs/promises"

const cli = cac("transformat")
cli
	.command(
		"<transformat> [file]",
		"transform [file] or stdin using <transformat>"
	)
	.action(async (transformat, file) => {
		const str = await readFile(file || process.stdin.fd)
		process.stdout.write()
	})

cli.parse()
