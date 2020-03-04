var expect = require('chai').expect;
var eval = require('..');

describe('@momsfriendlydevco/eval', ()=> {

	it('should evaluate simple expressions', ()=> {
		// expect(eval('foo', {foo: 'Foo!'})).to.equal('Foo!');
		expect(eval('foo == "Foo!"', {foo: 'Foo!'})).to.be.true;
		expect(eval('1 == 1', {foo: 1})).to.be.true;
		expect(eval('4 == 4', {foo: 1})).to.be.true;
		expect(eval('643 == 643.00', {foo: 1})).to.be.true;
		expect(eval('"1" == 1', {foo: 1})).to.be.true;
		expect(eval('foo == 1', {foo: 1})).to.be.true;
		expect(eval('foo == 1')).to.be.false;
		expect(eval('foo.foo.foo == 1', {foo: 1})).to.be.false;
		expect(eval('foo == 1', {foo: 'Foo!'})).to.be.false;
		//expect(eval(' foo == 1', {foo: 'Foo!'})).to.be.false;
		//expect(eval('foo == 1 ', {foo: 'Foo!'})).to.be.false;
		//expect(eval(' foo == 1 ', {foo: 'Foo!'})).to.be.false;
		// expect(eval('(foo == 1) && (bar == 2)', {foo: 1, bar: 2})).to.be.undefined;
		// expect(eval('(foo == 1 && (baz == 3)) && (bar == 2)', {foo: 1, bar: 2})).to.be.undefined;
		//expect(eval('foo == 1 && bar == 2', {foo: 1, bar: 2})).to.be.undefined;
	});

});