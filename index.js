const selectorParser = require('postcss-selector-parser');

const allowedAtRules = ['media', 'supports', 'document'];

module.exports = scope => {
	// Special case for the '&' selector, resolves to scope
	const processor = selectorParser(selectors => {
		let hasNestingSelector = false;

		selectors.walkNesting(selector => {
			hasNestingSelector = true;
			selector.replaceWith(selectorParser.string({ value: scope }));
		});

		if (!hasNestingSelector)
			selectors.first.prepend(selectorParser.string({ value: scope + ' ' }));
	});

	if (!isValidScope(scope))
		throw new Error('Invalid scope');

	function processRule(rule) {
		if (!isRuleScopable(rule))
			return rule;

		rule.selectors = rule.selectors.map(selector => {
			if (isScopeApplied(selector, scope))
				return selector;

			return processor.processSync(selector);
		});
	}

	function processAtRule(atRule) {
		atRule.walkRules(processRule);
	}

	return {
		postcssPlugin: 'postcss-scopify',
		AtRule: {
			media: processAtRule,
			supports: processAtRule,
			document: processAtRule
		},
		Rule: processRule
	};
};

module.exports.postcss = true;

/**
 * Determine if selector is already scoped
 *
 * @param {string} selector
 * @param {string} scope
 */
function isScopeApplied(selector, scope) {
	const selectorTopScope = selector.split(' ', 1)[0];
	return selectorTopScope === scope;
}

/**
 * Determine if scope is valid
 *
 * @param {string} scope
 */
function isValidScope(scope) {
	return scope && !scope.includes(',');
}

/**
 * Determine if rule should be scoped
 *
 * @param {rule} rule
 */
function isRuleScopable(rule){
	if (rule.parent.type === 'root')
		return true;

	if (rule.parent.type === 'atrule' && allowedAtRules.includes(rule.parent.name))
		return true;

	return false;
}
