// ext: .n
import Block, { pattern } from "transformat"

export default <Block>{
	lex: {
		whitespaceRegEx: /\s*/,

		tokens: {
			number: /\d+|\d*\.\d+/,
			openingParenthesis: "(",
			closingParenthesis: ")",

			// ops
			eq: "==",
			neq: "!=",

			add: "+",
			sub: "-",

			mul: "*",
			div: "/"
		},

		throw: "Halted at lexer: Unexpected token."
	},

	parse: {
		root: pattern`expression`,
		ast: {
			expression: pattern`o1 | primaryExpression`,
			o1: pattern`<primaryExpression> -> <mul | div> -> <primaryExpression>`,

			primaryExpression: pattern`parenExpr | negativeNumber | number`,

			parenExpr: pattern`openingParenthesis -> <expression> -> closingParenthesis`,
			negativeNumber: pattern`sub -> <number>`
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
