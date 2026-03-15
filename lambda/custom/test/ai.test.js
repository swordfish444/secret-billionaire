const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildPrompt,
  generateInsight,
  isTooSimilar,
  normalizeForComparison,
  trimToVoiceLimits,
} = require('../lib/ai');

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

test('buildPrompt includes the category and grounded brand guardrails', () => {
  const prompt = buildPrompt({
    category: 'BUSINESS_IDEA',
  });

  assert.match(prompt, /Business Idea/);
  assert.match(prompt, /premium, noir, strategic/);
  assert.match(prompt, /ordinary starting conditions/);
  assert.match(prompt, /Avoid sounding like the user already owns a conglomerate/);
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

test('normalizeForComparison removes labels and punctuation for similarity checks', () => {
  assert.equal(
    normalizeForComparison("Today's move: Package your follow-up into a fixed offer."),
    'package your follow up into a fixed offer',
  );
});

test('isTooSimilar flags nearly duplicated copy', () => {
  const repeated = isTooSimilar('Business idea: build a weekly dashboard for solo owners.', [
    'Business idea: build a weekly dashboard for solo business owners.',
  ]);

  const distinct = isTooSimilar('Business idea: offer late-invoice collection for contractors.', [
    'Business idea: build a weekly dashboard for solo business owners.',
  ]);

  assert.equal(repeated, true);
  assert.equal(distinct, false);
});

test('generateInsight retries and prefers a non-repeated AI response', async () => {
  const responses = [
    {
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: "Today's move: package your expertise into a fixed offer for one niche.",
            },
          },
        ],
      }),
    },
    {
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content:
                "Today's move: ask three paying customers where delays or rework still steal time, then turn the most repeated answer into a simple upsell.",
            },
          },
        ],
      }),
    },
  ];

  const insight = await generateInsight({
    apiToken: 'token',
    category: 'TODAYS_MOVE',
    recentInsights: ["Today's move: package your expertise into a fixed offer for one niche."],
    fallback: "Today's move: document one task you repeat every week.",
    fetchImpl: async () => responses.shift(),
  });

  assert.match(insight, /ask three paying customers/i);
});
