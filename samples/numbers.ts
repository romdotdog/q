// ext: .n
import Block from "transformat"

export default <Block>{
	lex: {
		whitespaceRegEx: /\s*/,

		tokens: [
			["number", /\d+|\d*\.\d+/],
			["openingParenthesis", "("],
			["closingParenthesis", ")"],

			// ops
			["eq", "=="],
			["neq", "!="],

			["add", "+"],
			["sub", "-"],

			["mul", "*"],
			["div", "/"]
		],

		throw: "Halted at lexer: Unexpected token."
	}
}

/*
parse: $Expression {
    // going top -> bottom

    Expression: $O2 + ((Eq | Neq) + $O2)* {
        O2: $O1 + ((Add | Sub) + $O1)* {
            O1: $Primary + ((Mul | Div) + $Primary)* {
                Primary: Number | Sub + Number | OpeningParenthesis + Expression + ClosingParenthesis;
            }
        }
    }

    [ Malformed expression. ]
}
*/