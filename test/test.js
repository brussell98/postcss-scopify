const assert = require('assert');
const fs = require('fs');
const postcss = require('postcss');
const scopify = require('..');

function fixture(name) {
	return fs.readFileSync('test/fixtures/' + name, 'utf8').trim();
}

describe('postcss-scopify', function() {
	it('scopes all selectors with an id', async function() {
		const output = (await postcss([scopify('#foo')]).process(fixture('id.css'))).css;
		const expected = fixture('id.expected.css');

		assert.strictEqual(output, expected);
	});

	it('scopes all selectors with a class', async function() {
		const output = (await postcss([scopify('.boo')]).process(fixture('class.css'))).css;
		const expected = fixture('class.expected.css');

		assert.strictEqual(output, expected);
	});

	it('replaces & selector with an id scope', async function() {
		const output = (await postcss([scopify('#boo')]).process(fixture('id-container.css'))).css;
		const expected = fixture('id-container.expected.css');

		assert.strictEqual(output, expected);
	});

	it('replaces & selector with a class scope', async function() {
		const output = (await postcss([scopify('.boo')]).process(fixture('class-container.css'))).css;
		const expected = fixture('class-container.expected.css');

		assert.strictEqual(output, expected);
	});

	it('does NOT adds a scope if it already exists', async function() {
		const output = (await postcss([scopify('.boo')]).process(fixture('existing.css'))).css;
		const expected = fixture('existing.expected.css');

		assert.strictEqual(output, expected);
	});

	it('does not allow invalid scopes', function() {
		assert.rejects(() => postcss([scopify('#foo , #boo')]).process(fixture('id.css')), 'Invalid scope');
	});

	it('treats empty scopes as invalid', function() {
		assert.rejects(() => postcss([scopify('')]).process(fixture('id.css')), 'Invalid scope');
	});

	// https://github.com/pazams/postcss-scopify/issues/7
	it('should not scope keyframe definitions', async function() {
		const output = (await postcss([scopify('#foo')]).process(fixture('keyframe.css'))).css;
		const expected = fixture('keyframe.expected.css');

		assert.strictEqual(output, expected);
	});

	it('should not scope at-rules, but do scope their nested rules for conditional groups at-rules only', async function() {
		const output = (await postcss([scopify('.boo')]).process(fixture('at-rules.css'))).css;
		const expected = fixture('at-rules.expected.css');

		assert.strictEqual(output, expected);
	});

	it('should not scope LESS/SASS style nested rules', async function() {
		const output = (await postcss([scopify('.boo')]).process(fixture('nested.css'))).css;
		const expected = fixture('nested.expected.css');

		assert.strictEqual(output, expected);
	});
});
