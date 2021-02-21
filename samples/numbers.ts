// ext: .n
import Block, { q } from "q"

export default <Block>{
	lex: {
		whitespaceRegEx: /\s*/,

		tokens: {
			number: /\d*\.\d+|\d+/,
			openingParenthesis: "(",
			closingParenthesis: ")",

			// ops
			sub: "-",

			mul: "*",
			div: "/"
		},

		throw: "Halted at lexer: Unexpected token."
	},

	parse: {
		root: q`expression`,
		ast: {
			expression: q`o1 | primaryExpression`,
			o1: q`<primaryExpression> -> <mul | div> -> <primaryExpression>`,

			primaryExpression: q`parenExpr | negativeNumber | number`,

			parenExpr: q`openingParenthesis -> <expression> -> closingParenthesis`,
			negativeNumber: q`sub -> <number>`
		}
	},

	gen: {
		syntaxes: {
			parenExpr: {
				serialize: (expr) => {
					return `(${expr})`
				}
			},
			negativeNumber: {
				serialize: (number) => {
					return `-${number}`
				}
			}
		}
	}
}
