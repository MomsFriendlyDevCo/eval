var expect = require('chai').expect;
var eval = require('..');

describe('@momsfriendlydevco/eval', ()=> {

	it('should evaluate simple expressions', ()=> {
		expect(eval('foo', {foo: 'Foo!'})).to.equal('Foo!');
		expect(eval('foo == "Foo!"', {foo: 'Foo!'})).to.be.true;
		expect(eval('1 == 1', {foo: 1})).to.be.true;
		expect(eval('4 == 4', {foo: 1})).to.be.true;
		expect(eval('643 == 643.00', {foo: 1})).to.be.true;
		expect(eval('"1" == 1', {foo: 1})).to.be.true;
		expect(eval('foo == 1', {foo: 1})).to.be.true;
		expect(eval('foo == 1')).to.be.false;
		expect(eval('foo.foo.foo == 1', {foo: 1})).to.be.false;
		expect(eval('foo == 1', {foo: 'Foo!'})).to.be.false;
		expect(eval(' foo == 1', {foo: 'Foo!'})).to.be.false;
		expect(eval('foo == 1 ', {foo: 'Foo!'})).to.be.false;
		expect(eval(' foo == 1 ', {foo: 'Foo!'})).to.be.false;
		expect(eval('1 && 2 && 3', {foo: 1, bar: 2})).to.equal(3);
		expect(eval('foo == 1 && bar == 2', {foo: 1, bar: 2})).to.be.true;
		expect(eval('(foo == 1) && (bar == 2)', {foo: 1, bar: 2})).to.be.true;
		expect(eval('(foo == 1 && (baz == 3)) && (bar == 2)', {foo: 1, bar: 2, baz: 3})).to.be.true;
	});

	it.skip('should evaluate function returns', ()=> {
		expect(eval('foo()', {foo: ()=> 'Foo!'})).to.equal('Foo!');
		expect(eval('foo(2)', {foo: (a) => a})).to.equal(2);
		expect(eval('foo(3, 4)', {foo: (a, b) => a + b})).to.equal(7);
	});

});
