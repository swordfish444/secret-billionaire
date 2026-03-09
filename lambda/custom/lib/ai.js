const { CATEGORIES } = require('./content');

const DEFAULT_MODEL = 'moonshotai/kimi-k2.5';
const DEFAULT_MAX_SENTENCES = 3;
const DEFAULT_MAX_WORDS = 90;

function normalizeWhitespace(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sentenceListFromText(text) {
  const normalized = normalizeWhitespace(text);

  if (!normalized) {
    return [];
  }

  return (normalized.match(/[^.!?]+[.!?]["']?|.+$/g) || [])
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function ensureSentenceEnding(sentence) {
  return /[.!?]["']?$/.test(sentence) ? sentence : `${sentence}.`;
}

function wordCount(text) {
  const normalized = normalizeWhitespace(text);
  return normalized ? normalized.split(' ').length : 0;
}

function trimToVoiceLimits(
  text,
  {
    maxSentences = DEFAULT_MAX_SENTENCES,
    maxWords = DEFAULT_MAX_WORDS,
  } = {},
) {
  const sentences = sentenceListFromText(text)
    .map((sentence) => ensureSentenceEnding(sentence))
    .slice(0, maxSentences);

  const selected = [];

  for (const sentence of sentences) {
    const candidate = normalizeWhitespace([...selected, sentence].join(' '));

    if (!selected.length || wordCount(candidate) <= maxWords) {
      selected.push(sentence);
      continue;
    }

    break;
  }

  return normalizeWhitespace(selected.join(' '));
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function ensureCategoryLead(text, category) {
  const label = CATEGORIES[category]?.label || CATEGORIES.TODAYS_MOVE.label;
  const leadPattern = new RegExp(`^${escapeRegExp(label)}\\s*:`, 'i');
  const normalized = normalizeWhitespace(text).replace(/^secret billionaire[.!?,:\s-]*/i, '');

  if (leadPattern.test(normalized)) {
    return normalized;
  }

  return `${label}: ${normalized}`;
}

function extractMessageContent(payload) {
  const content = payload?.choices?.[0]?.message?.content;

  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }

        if (part?.type === 'text' && typeof part.text === 'string') {
          return part.text;
        }

        return '';
      })
      .join(' ');
  }

  return '';
}

function buildPrompt({ category }) {
  const categoryLabel = CATEGORIES[category]?.promptLabel || CATEGORIES.TODAYS_MOVE.promptLabel;

  return [
    'Write one response for an Alexa skill called Secret Billionaire.',
    `Category: ${categoryLabel}.`,
    'Voice: premium, noir, strategic, mysterious, practical, concise, high agency.',
    'Theme: leverage, ownership, systems, distribution, recurring revenue, scale, opportunity recognition, empire building.',
    'Output: 1 to 3 sentences, 40 to 90 words, voice friendly, memorable, useful.',
    `Start with the exact label "${categoryLabel === "Today's Move" ? "Today's move" : CATEGORIES[category]?.label || "Today's move"}:".`,
    'Do not use bullet points, markdown, emojis, quotes, or citations.',
    'Do not sound generic, cheesy, spiritual, or like an Instagram motivation page.',
    'Do not include illegal tactics, deception, fraud, market manipulation, insider trading, tax evasion, or personalized investment, legal, or tax advice.',
    'Return only the final spoken copy.',
  ].join(' ');
}

async function requestOpenRouterInsight({
  apiToken,
  category,
  fetchImpl = fetch,
  model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
}) {
  if (!apiToken) {
    return null;
  }

  const response = await fetchImpl('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/swordfish444/secret-billionaire',
      'X-Title': 'Secret Billionaire',
    },
    body: JSON.stringify({
      model,
      temperature: 0.95,
      max_tokens: 180,
      reasoning: {
        effort: 'none',
        exclude: true,
      },
      messages: [
        {
          role: 'system',
          content:
            'You write sharp spoken micro-coaching for Alexa. Keep every answer compact, practical, ethical, and distinct.',
        },
        {
          role: 'user',
          content: buildPrompt({ category }),
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`OPENROUTER_ERROR ${response.status} ${body}`.trim());
  }

  const payload = await response.json();
  return extractMessageContent(payload);
}

async function generateInsight({
  apiToken = process.env.OPENROUTER_TOKEN,
  category = 'TODAYS_MOVE',
  fallback,
  fetchImpl = fetch,
  maxSentences = Number(process.env.AI_MAX_SENTENCES || DEFAULT_MAX_SENTENCES),
  maxWords = Number(process.env.AI_MAX_WORDS || DEFAULT_MAX_WORDS),
} = {}) {
  const fallbackInsight = typeof fallback === 'function' ? fallback() : String(fallback || '');

  if (!apiToken) {
    return trimToVoiceLimits(ensureCategoryLead(fallbackInsight, category), {
      maxSentences,
      maxWords,
    });
  }

  try {
    const generated = await requestOpenRouterInsight({
      apiToken,
      category,
      fetchImpl,
    });

    return trimToVoiceLimits(ensureCategoryLead(generated || fallbackInsight, category), {
      maxSentences,
      maxWords,
    });
  } catch (error) {
    console.error('Secret Billionaire AI generation failed', error);
    return trimToVoiceLimits(ensureCategoryLead(fallbackInsight, category), {
      maxSentences,
      maxWords,
    });
  }
}

module.exports = {
  DEFAULT_MAX_SENTENCES,
  DEFAULT_MAX_WORDS,
  buildPrompt,
  extractMessageContent,
  generateInsight,
  trimToVoiceLimits,
};
