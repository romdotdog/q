import { readFile } from "fs/promises"
import { basename, join, resolve } from "path"
import webpack from "webpack"

export function compile(q: string): Promise<string> {
	const outFile = basename(q).replace(/\.ts(x?)$/, ".js$1")
	const compiler = webpack({
		mode: "development",
		entry: q,
		output: {
			filename: outFile,
			libraryTarget: "commonjs2"
		},
		resolve: {
			// Add `.ts` and `.tsx` as a resolvable extension.
			extensions: [".ts", ".tsx", ".js"],
			alias: {
				q: resolve(__dirname, "q.js")
			}
		},
		module: {
			rules: [
				// all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
				{
					test: /\.tsx?$/,
					loader: "ts-loader",
					options: {
						configFile: "tsconfig.json"
					}
				}
			]
		}
	})

	return new Promise((resolve) => {
		compiler.run((err, res) => {
			if (err) throw err

			if (res) {
				readFile(join("dist/", outFile), { encoding: "utf-8" }).then(resolve)
			} else {
				throw new Error("webpack.Stats is undefined.")
			}
		})
	})
}
