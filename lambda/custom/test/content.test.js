const test = require('node:test');
const assert = require('node:assert/strict');

const { CATEGORIES, fallbackInsightFor } = require('../lib/content');

test('fallbackInsightFor returns content for each category', () => {
  for (const category of Object.keys(CATEGORIES)) {
    assert.equal(typeof fallbackInsightFor(category), 'string');
    assert.notEqual(fallbackInsightFor(category).length, 0);
  }
});
