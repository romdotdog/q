import { cac } from "cac"
import { readFile } from "fs/promises"
import { lex } from "./tr/lex"

const cli = cac("transformat")
cli
	.command(
		"<transformat> [file]",
		"transform [file] or stdin using <transformat>"
	)
	.action(async (transformat: string, file) => {
		console.log(lex(await readFile(transformat, { encoding: "utf-8" })))

		//const str = await readFile(file || process.stdin.fd)
		//process.stdout.write()
	})

cli.parse()
