import { cac } from "cac"
import { readFile } from "fs/promises"
import { parse } from "./tr/parse"

const cli = cac("transformat")
cli
	.command(
		"<transformat> [file]",
		"transform [file] or stdin using <transformat>"
	)
	.action(async (transformat: string, file) => {
		console.log(
			JSON.stringify(
				parse(await readFile(transformat, { encoding: "utf-8" })),
				null,
				4
			)
		)

		//const str = await readFile(file || process.stdin.fd)
		//process.stdout.write()
	})

cli.parse()
