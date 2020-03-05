var eval = module.exports = function eval(expression, context = {}, options = {}) {
	// console.log('---', expression, '---');
	var settings = {...eval.defaults, ...options};
	if (!settings.re.operand) settings.re.operand = eval.compileOperands(settings.operands);


	// Implementation of the Shunting-yard alorithm
	// @see https://en.wikipedia.org/wiki/Shunting-yard_algorithm
	var output = []; // {t, v}
	var operators = [];


	var expr = expression.trim() + ' ';
	while (expr) {
		var nextMatch;
		if (nextMatch = settings.re.number.exec(expr)) { // Is a literal number
			output.push({t: 'token', tt: 'numeric', v: parseFloat(nextMatch[1])});
			expr = expr.substr(nextMatch.index + nextMatch[1].length).trimStart();
		} else if (nextMatch = settings.re.function.exec(expr)) { // Function refrence e.g. 'foo()'
			if (!context[nextMatch[1]]) throw new Error(`Unknown function "${nextMatch[1]}"`);
			operators.push({t: 'operand', ...settings.operands[':SPECIAL:FUNC'], func: context[nextMatch[1]]});
			expr = expr.substr(nextMatch.index + nextMatch[1].length).trimStart();
		} else if (nextMatch = settings.re.operand.exec(expr)) { // Is an operator
			var myOperand = settings.operands[nextMatch[1]];
			while (operators.length) {
				var lastOperand = operators[operators.length - 1];
				if (
					lastOperand.sort > myOperand.sort // Last in stack has greater precidence
					|| lastOperand != settings.operands[':SPECIAL:(']
				) {
					output.push(operators.pop());
				} else { // Stop popping from operators -> output when we reach a non-match for the above
					break;
				}
			}
			operators.push({t: 'operand', ...myOperand});
			expr = expr.substr(nextMatch.index + nextMatch[1].length).trimStart();
		} else if (settings.re.groupStart.test(expr)) { // Left paren
			operators.push({t: 'operand', ...settings.operands[':SPECIAL:(']});
			expr = expr.substr(1).trimStart();
		} else if (settings.re.groupEnd.test(expr)) { // Right paren
			operators.push({t: 'operand', ...settings.operands[':SPECIAL:)']});
			while (operators.length > 0 && operators[operators.length - 1] != settings.operands[':SPECIAL:)']) { // While last operator is not left paren
				output.push(operators.pop());
			}
			if (operators.length > 0 && operators[operators.length - 1] != settings.operands[':SPECIAL:(']) { // Disguard left parent at top of operator stack
				operators.pop();
			}
			expr = expr.substr(1).trimStart();
		} else if (nextMatch = settings.re.token.exec(expr)) { // Treat everything else as a string / context lookup
			if (['"', "'"].includes(nextMatch[2])) { // Literal string (enclosed in ' / " marks)
				output.push({t: 'token', tt: 'string', v: nextMatch[1].substr(1, nextMatch[1].length -2)});
			} else { // Assume context lookup
				output.push({t: 'token', tt: 'contextLookup', v: eval.get(context, nextMatch[1])});
			}

			expr = expr.substr(nextMatch.index + nextMatch[1].length).trimStart();
		} else {
			throw new Error('Unknown syntax error');
		}
	}

	// Pop everything from operator stack to output
	while (operators.length) {
		output.push(operators.pop());
	}

	// console.log('RPN', output);

	var stack = output.reduce((t, v) => {
		if (v.t == 'operand' && v.sort == 21) {
			// Ignore parem closures (unless they are functions)
			if (v.func) {
				// console.log('RUN FUNC WITH', t);
				var result = v.func.apply(context, t.map(i => i.v));
				// console.log('=', result);
				t = [];
				t.push({t: 'funcResult', v: result});
			}
		} else if (v.t == 'operand') {
			var right = t.pop();
			var left = t.pop();
			// console.log('PARSE BUCKET', {operand: v.sort, left, right});
			var result = v.handler(left.v, right.v);
			t.push({t: 'result', v: result});
			// console.log('=', result);
		} else if (v.t == 'token') {
			t.push(v);
		} else {
			throw new Error('Unsupported stack type', v.type);
		}
		return t;
	}, []);

	if (stack.length == 1) return stack[0].v;
	throw new Error('Remaining unparsed stack!');
};


/**
* Default options to use
* @type {Object}
*/
eval.defaults = {
	re: {
		// Regular expressions used for parsing {{{
		groupStart: /^\(/,
		groupEnd: /^\)/,
		function: /^([a-z0-9\_]+)\(/, // NOTE: This should only capture up to the first paren
		functionArgs: /^,/, // Used to seperate function args as a list
		number: /^([0-9\.]+)/,
		token: /^((['|"])?.*?\2)[^a-z0-9_\.]/i,
		operand: false, // If falsy will be computed on each run
		// }}}
	},
	operands: {
		// Supported JS operands {{{
		// Operand precidence taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
		':SPECIAL:(': {sort: 21, handler: (a, b) => false},
		':SPECIAL:)': {sort: 21, handler: (a, b) => false},
		':SPECIAL:FUNC': {sort: 21, handler: (a, b) => false},
		// FIXME: 20 - Member access
		// FIXME: 20 - Computed member access
		// FIXME: 20 - NEW with arg list
		// FIXME: 20 - Function call
		// FIXME: 20 - Optional chaining
		// FIXME: 19 - NEW without arg list
		// FIXME: 18 - Postfix increment
		// FIXME: 18 - Postfix decrement
		// FIXME: 17 - Logical NOT (!)
		// FIXME: 17 - Bitwise NOT (~)
		// FIXME: 17 - Unary Plus (+)
		// FIXME: 17 - Unary Negation (-)
		// FIXME: 17 - Prefix increment
		// FIXME: 17 - Prefix decrement
		// FIXME: 17 - typeof
		// FIXME: 17 - void
		// FIXME: 17 - delete
		// FIXME: 17 - await
		// FIXME: 16 - Exponentiation (**)
		'*': {sort: 15, handler: (a, b) => a * b},
		'/': {sort: 15, handler: (a, b) => a / b},
		'%': {sort: 15, handler: (a, b) => a % b},
		'+': {sort: 14, handler: (a, b) => a + b},
		'-': {sort: 14, handler: (a, b) => a - b},
		// FIXME: 13 - Bitwise left shift (<<)
		// FIXME: 13 - Bitwise right shift (>>)
		// FIXME: 13 - Bitwise unsigned right shift (>>>)
		'<': {sort: 12, handler: (a, b) => a < b},
		'<=': {sort: 12, handler: (a, b) => a <= b},
		'>': {sort: 12, handler: (a, b) => a > b},
		'>=': {sort: 12, handler: (a, b) => a >= b},
		// FIXME: 12 - in
		// FIXME: 12 - instanceof
		'==': {sort: 11, handler: (a, b) => a == b},
		'!=': {sort: 11, handler: (a, b) => a != b},
		'===': {sort: 11, handler: (a, b) => a === b},
		'!==': {sort: 11, handler: (a, b) => a !== b},
		'&': {sort: 10, handler: (a, b) => a & b},
		'^': {sort: 9, handler: (a, b) => a ^ b},
		'|': {sort: 8, handler: (a, b) => a | b},
		'??': {sort: 7, handler: (a, b) => a === undefined || a === null ? b : a},
		'&&': {sort: 6, handler: (a, b) => a && b},
		'||': {sort: 5, handler: (a, b) => a || b},
		// FIXME: 4 - Ternary
		// FIXME: 3 - Assignment... (see docs)
		// FIXME: 2 - yield, yield*
		',': {sort: 1, handler: (a, b) => {
			console.log('PROC ARG', {a, b});
			return [a, b];
		}}, // Arg list sequence
		// }}}
	},
};


/**
* Compute the operand RegExp from the list of operands
* This function is called automatically if `settings.re.operands` is falsy on either the default structure or each `eval()` call
* @param {Object} operands The operands to compute the RegExp from
* @returns {RegExp} Compiled regular expression for the operands matcher
*/
eval.compileOperands = operands => new RegExp(
	'^('
	+ Object.keys(operands)
		.filter(k => !k.startsWith(':SPECIAL:'))
		.sort((a, b) => a.length == b.length ? a.length > b.length ? 0 : 1 : -1) // Preference longer expressions over shorter (to prevent '&&' matching after '&')
		.map(k => k.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')) // RegExp escape. See https://github.com/MomsFriendlyDevCo/Nodash
		.join('|')
	+ ')'
);


/**
* Retrieve a deeply nested value of a complex object
* This is functionally the same as Lodash's get() function
* @param {*} item The item to traverse
* @param {string} path The dotted notation path to retrieve
* @return {*} The value of the traversed field or undefined
* @url https://github.com/MomsFriendlyDevCo/Nodash
*/
eval.get = (item, path) => {
	var target = item;
	var pathPieces = path.split('.');
	for (var i = 0; i < pathPieces.length; i++) {
		if (!target[pathPieces[i]]) {
			target = undefined;
			break;
		}
		target = target[pathPieces[i]];
	};
	return target;
};


// Compile eval.defaults.re.operand for the first time
eval.defaults.re.operand = eval.compileOperands(eval.defaults.operands);
