// transforms an extended numbers dialect into APL while simulaneously reordering operators

import Block, { GenericSyntax, q, Visitor } from "q"
// Order of Operations are right to left in APL without exception

// ((0.5 * 4 * 10.0 + 5) / 5 == 10) - 45
// -> -45 in JS

// 45-⍨10=5÷⍨5+0.5×4×10.0
// -> ¯45 in APL

const opConversion = {
	"==": "=",
	"!=": "≠",

	"<=": "≤",
	">=": "≥",

	">": ">",
	"<": "<",

	"*": "×",
	"/": "÷",

	"+": "+",
	"-": "-",

	"^": "*"
} as Record<string, string>

const symmetricalOp = {
	"=": false,
	"≠": false,

	"≤": ">",
	"≥": "<",

	">": "≤",
	"<": "≥",

	"×": false,
	"÷": "÷⍨",

	"+": false,
	"-": "-⍨",

	"*": "*⍨"
} as Record<string, string | false>

function getSyntaxDepth(value: (GenericSyntax | null)[]): number {
	return 1 + Math.max(...value.map((s) => (s ? getSyntaxDepth(s.groups) : 0)))
}

/**
 * Traverses into the syntax until it can find a non-botched operator / primaryexpression
 */
function getMeaningful(syntax: GenericSyntax): GenericSyntax {
	return syntax.type &&
		((syntax.type.startsWith("o") && syntax.groups.length < 3) ||
			(syntax.type === "primaryExpression" && syntax.groups.length > 0))
		? getMeaningful(syntax.groups[0])
		: syntax
}

/**
 * Check if a syntax has a binary operation inside it
 */
function hasBinOpExpr(syntax: GenericSyntax): boolean {
	return (
		!!(
			// check if this is a binary expr
			(syntax.type && syntax.type.startsWith("o") && syntax.groups.length === 3) // rhs
		) || syntax.groups.some((s) => s && hasBinOpExpr(s)) // or one of its child groups is one
	)
}

/**
 * Get first syntax that is not parenExpr
 */
function stripParenthesis(syntax: GenericSyntax): GenericSyntax {
	return syntax.type !== "parenExpr"
		? syntax
		: stripParenthesis(syntax.groups[0])
}

const operatorVisitor: Visitor = (syntax) => {
	const groups = syntax.groups
	let lhs = groups[0],
		rhs = groups[2]

	const op = groups[1]

	if (lhs && op && rhs) {
		lhs = stripParenthesis(getMeaningful(lhs))
		rhs = stripParenthesis(getMeaningful(rhs))
		console.log(lhs)

		const opToken = op.source[0].source
		opToken[0] = opConversion[opToken[0]]

		if (getSyntaxDepth(lhs.groups) > getSyntaxDepth(rhs.groups)) {
			opToken[0] = symmetricalOp[opToken[0]] || opToken[0]
			;[lhs, rhs] = [rhs, lhs]
		}

		// put back parenthesis in lhs if needed
		if (hasBinOpExpr(lhs)) {
			lhs = {
				type: "parenExpr",
				groups: [lhs],
				source: []
			}
		}

		syntax.groups = [lhs, op, rhs]
	}
}

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

			o4: q`o3 -> (<eq | neq | g | l | ge | le> -> (o4 | o3))?`,
			o3: q`o2 -> (<add | sub> -> (o3 | o2))?`,
			o2: q`o1 -> (<mul | div> -> (o2 | o1))?`,
			o1: q`primaryExpression -> (exp -> (o1 | primaryExpression))?`,

			primaryExpression: q`parenExpr | negativeNumber | number`,

			parenExpr: q`openingParenthesis -> <expression> -> closingParenthesis`,
			negativeNumber: q`sub -> <number>`
		}
	},

	gen: {
		syntaxes: {
			o4: {
				visit: operatorVisitor
			},
			o3: {
				visit: operatorVisitor
			},
			o2: {
				visit: operatorVisitor
			},
			o1: {
				visit: operatorVisitor
			},

			parenExpr: {
				serialize: ({ groups: [expr] }) => {
					return `(${expr})`
				}
			},

			negativeNumber: {
				serialize: ({ groups: [number] }) => {
					return `-${number}`
				}
			}
		},
		$joiner: (accumulator, serializedSyntax) =>
			accumulator.length == 0
				? serializedSyntax
				: accumulator + serializedSyntax
	}
}
