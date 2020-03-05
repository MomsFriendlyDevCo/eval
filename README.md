@momsfriendlydevco/eval
=======================
Safe expression evaluator.

This function is an implementation of the [Shunting-Yard Alorithm](https://en.wikipedia.org/wiki/Shunting-yard_algorithm) which parses a regular JavaScript expression, runs it though a [Reverse Polish Notation](https://en.wikipedia.org/wiki/Reverse_Polish_notation) parser and returns a result.

The output of this function is the evaluated result of the line, along with any optionally supplied context.


Examples
--------
```javascript
var eval = require('@momsfriendlydevco/eval');

// Simple evaluations
eval('1'); //= 1
eval('1 + 1'); //= 2
eval('"a" + "b" + "c"'); //= "abc"


// Using an optional context
eval('foo + bar', {foo: 1, bar: 2}); //= 3
eval('foo(bar)', {foo: a => a, bar: 10}); //= 10
eval('add(10, 20)', {add: (a, b) => a + b}); //= 30
```


API
===

eval(expression, context, options)
----------------------------------
Evaluate a JavaScript style expression and return the result.
Context is an object of optional variables to allow access to or functions to support.
Default options can also be set in `eval.defaults`.

Options are:

| Option       | Type              | Default  | Description                                                                                                              |
|--------------|-------------------|----------|--------------------------------------------------------------------------------------------------------------------------|
| `re`         | Object            | See code | List of Regular expressions used to parse the expression                                                                 |
| `re.operand` | Boolean or RegExp | `false`  | The regular expression used to parse operands, if specifying your own operands this needs to be falsy to force recompile |
| `operands`   | Object            | See code | List of Operands to support                                                                                              |


eval.defaults
-------------
Object of default values to use when calling `eval()`.


eval.get(target, path)
----------------------
Internal function to retrieve a dotted notation path in an expression. Similar to the [Lodash Get](https://lodash.com/docs#get) function.


eval.compileOperands(operands)
------------------------------
Compiler to return the optimized Regular Expression of the operands structure. Called automatically if `settings.re.operands` is falsy or on initalization of the module.
Invoke this function manually and stash the result in defaults if defining a custom operand chain.

```javascript
eval.defaults.re.operand = eval.compileOperands(eval.defaults.operands);
```



Why?
----
There are a number of reasons this module is necessary instead of using plain `eval()`:

1. **Its safe** - Its _eval_, have you used it? Its not meant to be used for anything. Eval is massivly unsafe and unless used exactly right can cause major harm
2. **Babel safe** - This module does not use any JS parsing, it uses its own internal lexing + parsing engine
3. **Context is sandboxed** - Only exposed variables and functions are accessible within an expression, nothing else is accepted
4. **Implements only a subset of the JS stanard** - Advanced JS concepts like Classes and Assignments are configurable (eventually - see the Todo list)


Todo
====
Lexical features of JavaScript and their support:

| Precedence | Type                   | Syntax                                   | Supported |
|------------|------------------------|------------------------------------------|-----------|
|         21 | Parenthesis            | `(`, `)`                                 | Yes       |
|         20 | Member access          | `a.b.c`                                  | Yes       |
|         20 | New with arg list      | `new A()`                                |           |
|         20 | Functions              | `a(b, c)`                                | Yes       |
|         18 | Postfixes              | `a--`, `b++`                             |           |
|         17 | Logical NOT            | `!a`                                     |           |
|         17 | Bitwise NOT            | `~a`                                     |           |
|         17 | Unary plus             | `+a`                                     |           |
|         17 | Unary negation         | `-a`                                     |           |
|         17 | Typeof                 | `typeof a`                               |           |
|         17 | Void                   | `void`                                   |           |
|         17 | Delete                 | `delete a`                               |           |
|         17 | Await                  | `await a()`                              |           |
|         16 | Exponentials           | `a ** b`                                 |           |
|         15 | Multiplication         | `a * b`                                  | Yes       |
|         15 | Division               | `a / b`                                  | Yes       |
|         15 | Remainder              | `a % b`                                  | Yes       |
|         14 | Addition               | `a + b`                                  | Yes       |
|         14 | Subtraction            | `a - b`                                  | Yes       |
|         13 | Bitwise shift          | `a << b`, `a >> b`, `a >>> b`            |           |
|         12 | Lower than (or equal)  | `a < b`, `a <= b`                        | Yes       |
|         12 | Higher than (or equal) | `a > b`, `a >= b`                        | Yes       |
|         12 | In                     | `a in b`                                 |           |
|         12 | Instance of            | `a instanceof b`                         |           |
|         11 | (In)Equality           | `a == b`, `a != b`, `a === b`, `a !== b` | Yes       |
|         10 | Bitwise AND            | `a & b`                                  |           |
|          9 | Bitwise XOR            | `a ^ b`                                  |           |
|          8 | Bitwise OR             | `a | b`                                  |           |
|          7 | Nullish coalescing     | `a ?? b`                                 | Yes       |
|          6 | Logical AND            | `a && b`                                 | Yes       |
|          5 | Logical OR             | `a || b`                                 | Yes       |
|          4 | Ternary                | `a ? b : c`                              |           |
|          3 | Assignment             | `a = b`                                  |           |
|          2 | Yield                  | `yield a` or `yield* a`                  |           |
|          1 | Comma lists            | `a, b, c`                                |           |
