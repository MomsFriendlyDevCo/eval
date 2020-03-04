var eval = module.exports = function eval(expression, context = {}, options = {}) {
	console.log('---', expression, '---');
	var settings = {
		reGroupStart: /^\(/,
		reGroupEnd: /^\)/,
		reToken: /^((['|"])?.*?\2)[^a-z0-9_\.]/i,
		reOperand: /^(==|=|<|>|<=|>=|IN|NOT|AND|\&\&|\|\|)/i,
		operands: {
			'==': (a, b) => a == b,
			'===': (a, b) => a === b,
			'!=': (a, b) => a != b,
			'!==': (a, b) => a !== b,
			'<': (a, b) => a < b,
			'>': (a, b) => a > b,
			'<=': (a, b) => a <= b,
			'>=': (a, b) => a >= b,
		},
		...options,
	};

	var parsed = [];
	var parsedOperandBucket = []; // Next operand(s) to add when encountering two tokens in sequence
	var expr = expression + ' ';
	var mode = 'token';

	while (expr) {
		var nextMatch;
		if (nextMatch = settings.reGroupStart.exec(expr)) {
			console.log('GROUP-START', nextMatch);
			parsed.push({t: 'eval', from: 'start'});
			expr = expr.substr(nextMatch[0].length).trimStart();
			mode = 'token';
		} else if (nextMatch = settings.reGroupEnd.exec(expr)) {
			console.log('GROUP-END', nextMatch);
			parsedOperandBucket.push({t: 'eval', from: 'end'});
			expr = expr.substr(nextMatch[0].length).trimStart();
			mode = 'token';
		} else if (mode == 'token') {
			nextMatch = settings.reToken.exec(expr);
			if (!nextMatch) throw new Error('Expected token');
			// console.log('TOKEN', {expr, token: nextMatch[1], braces: nextMatch[2], finite: isFinite(nextMatch[1])});

			if (['"', "'"].includes(nextMatch[2])) { // Literal string (enclosed in ' / " marks)
				parsed.push({t: 'token', v: nextMatch[1].substr(1, nextMatch[1].length -2)});
			} else if (isFinite(nextMatch[1])) { // Literal numeric
				parsed.push({t: 'token', v: parseFloat(nextMatch[1])});
			} else { // Assume context lookup
				parsed.push({t: 'token', v: eval.get(context, nextMatch[1])});
			}

			if (parsedOperandBucket.length) {
				parsed.push(parsedOperandBucket.pop());
			}

			expr = expr.substr(nextMatch.index + nextMatch[1].length).trimStart();
			mode = 'operand';
		} else if (mode == 'operand') {
			nextMatch = settings.reOperand.exec(expr);
			if (!nextMatch) throw new Error('Expected operand');
			// console.log('OPERAND', {expr, operand: nextMatch[1]});
			parsedOperandBucket.push({t: 'operand', v: nextMatch[1]});
			expr = expr.substr(nextMatch.index + nextMatch[1].length).trimStart();
			mode = 'token';
		} else {
			throw new Error('Unknown mode');
		}
	}


	console.log('PARSED', parsed);
	var stack = parsed.reduce((t, v) => {
		if (v.t == 'operand') {
			if (!settings.operands[v.v]) throw new Error(`Unsupported operand "${v.v}"`);
			var right = t.pop().v;
			var left = t.pop().v;
			var result = settings.operands[v.v](left, right);
			t.push(result);
			console.log('PARSE BUCKET', {operand: v.v, left, right, result});
		} else if (v.t == 'token') {
			t.push(v);
		} else {
			throw new Error('Unsupported stack type', v.type);
		}
		return t;
	}, []);
	console.log('---END---');

	if (stack.length == 1) return stack[0];
	console.log('REMAINING STACK', stack);
	throw new Error('Remaining unparsed stack!');
};


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
