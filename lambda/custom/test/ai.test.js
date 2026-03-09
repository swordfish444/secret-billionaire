const test = require('node:test');
const assert = require('node:assert/strict');

const { buildPrompt, generateInsight, trimToVoiceLimits } = require('../lib/ai');

test('trimToVoiceLimits keeps output compact', () => {
  const trimmed = trimToVoiceLimits(
    "Today's move: build the machine. Second sentence adds clarity. Third sentence stays in bounds. Fourth sentence should disappear.",
    {
      maxSentences: 3,
      maxWords: 16,
    },
  );

  assert.equal(trimmed, "Today's move: build the machine. Second sentence adds clarity. Third sentence stays in bounds.");
});

test('buildPrompt includes the category and brand guardrails', () => {
  const prompt = buildPrompt({
    category: 'BUSINESS_IDEA',
  });

  assert.match(prompt, /Business Idea/);
  assert.match(prompt, /premium, noir, strategic/);
  assert.match(prompt, /illegal tactics/);
});

test('generateInsight falls back cleanly without a token', async () => {
  const insight = await generateInsight({
    apiToken: '',
    category: 'TEN_X_QUESTION',
    fallback: '10X question: what scales even when your calendar is full?',
  });

  assert.equal(insight, '10X question: what scales even when your calendar is full?');
});
