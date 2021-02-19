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
			primaryExpression: pattern`number | sub -> number | openingParenthesis -> expression -> closingParenthesis`,
			o1: pattern`<primaryExpression> -> <(mul | div)> -> <primaryExpression>`,
			expression: pattern`o1 | primaryExpression`
		}
	}
}

/*
parse: $expression {
    // going top -> bottom

    expression: $O2 + ((Eq | Neq) + $O2)* {
        O2: $o1 + ((Add | sub) + $o1)* {
            o1: $Primary + ((mul | div) + $Primary)* {
                Primary: number | sub + number | openingParenthesis + expression + closingParenthesis;
            }
        }
    }

    [ Malformed expression. ]
}
*/
