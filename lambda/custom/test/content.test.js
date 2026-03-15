const test = require('node:test');
const assert = require('node:assert/strict');

const {
  CATEGORIES,
  fallbackInsightFor,
  nextCategoryFor,
  suggestionLabelFor,
} = require('../lib/content');

test('fallbackInsightFor returns content for each category', () => {
  for (const category of Object.keys(CATEGORIES)) {
    assert.equal(typeof fallbackInsightFor(category), 'string');
    assert.notEqual(fallbackInsightFor(category).length, 0);
  }
});

test('fallbackInsightFor avoids excluded insights when alternatives exist', () => {
  const excluded = fallbackInsightFor('TODAYS_MOVE');
  const next = fallbackInsightFor('TODAYS_MOVE', {
    exclude: [excluded],
  });

  assert.notEqual(next, excluded);
});

test('nextCategoryFor rotates to a valid follow-up category', () => {
  const category = nextCategoryFor('TODAYS_MOVE', {
    exclude: ['MINDSET_SHIFT'],
  });

  assert.ok(['BUSINESS_IDEA', 'OPPORTUNITY_SPOTTER'].includes(category));
});

test('suggestionLabelFor returns speech-friendly labels', () => {
  assert.equal(suggestionLabelFor('MINDSET_SHIFT'), 'a mindset shift');
  assert.equal(suggestionLabelFor('OPPORTUNITY_SPOTTER'), 'an opportunity spotter');
});
