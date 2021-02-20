import Block, { q } from "transformat"

export default <Block>{
	lex: {
		whitespaceRegEx: /\s*/,

		tokens: {
			number: /\d*\.\d+|\d+/,
			openingParenthesis: "(",
			closingParenthesis: ")",

			// ops
			eq: "==",
			neq: "!=",

			g: ">",
			l: "<",

			ge: ">=",
			le: "<=",

			// arithmetic

			add: "+",
			sub: "-",

			mul: "*",
			div: "/",

			exp: "^"
		},

		throw: "Halted at lexer: Unexpected token."
	},

	parse: {
		root: q`expression`,
		ast: {
			expression: q`o4`,

			o4: q`<o3> -> <eq | neq | g | l | ge | le> -> <o3> | <o3>`,
			o3: q`<o2> -> <add | sub> -> <o2> | <o2>`,
			o2: q`<o1> -> <mul | div> -> <o1> | <o1>`,
			o1: q`<primaryExpression> -> exp -> <primaryExpression> | <primaryExpression>`,

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
