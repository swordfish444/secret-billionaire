const { CATEGORIES } = require('./content');

const DEFAULT_MODEL = 'moonshotai/kimi-k2.5';
const DEFAULT_MAX_SENTENCES = 3;
const DEFAULT_MAX_WORDS = 90;
const DEFAULT_REQUEST_TIMEOUT_MS = 5500;
const MAX_RECENT_INSIGHTS = 12;
const MAX_RECENT_PROMPT_REFERENCES = 4;
const EVERYDAY_AUDIENCES = [
  'a salaried professional building a side income',
  'an early founder testing a first offer',
  'a freelancer trying to become an owner instead of just a worker',
  'a small business operator trying to buy back time',
  'a creator or consultant trying to package expertise into recurring revenue',
  'an ambitious person with limited time, limited cash, and real-world responsibilities',
];
const CATEGORY_ANGLES = {
  BUSINESS_IDEA: [
    'local service operators',
    'freelancers and consultants',
    'creators and audience businesses',
    'small B2B workflow pain',
    'administrative bottlenecks',
    'follow-up and conversion friction',
  ],
  MINDSET_SHIFT: [
    'owning the customer path',
    'turning expertise into an asset',
    'buying back time with systems',
    'replacing busyness with leverage',
    'building recurring revenue from ordinary skill',
    'making decisions with scale in mind',
  ],
  OPPORTUNITY_SPOTTER: [
    'repeated household or work annoyances',
    'messy follow-up processes',
    'fragmented information across tools',
    'local businesses with manual workflows',
    'small teams stuck in spreadsheets and inboxes',
    'services people delay but still need',
  ],
  TEN_X_QUESTION: [
    'delegation and systems',
    'audience and distribution',
    'pricing and offer design',
    'recurring revenue',
    'time leverage',
    'niche positioning',
  ],
  TODAYS_MOVE: [
    'packaging a service',
    'validating demand quickly',
    'documenting a repeatable process',
    'improving follow-up',
    'finding a profitable niche problem',
    'creating simple leverage from current assets',
  ],
};
const RECENT_OUTPUTS = [];
const CATEGORY_INSTRUCTIONS = {
  BUSINESS_IDEA:
    'State a specific problem, the solution, and why it could scale. Keep it simple, concrete, and voice friendly.',
  MINDSET_SHIFT:
    'Deliver one sharp reframe about leverage, ownership, systems, scale, or decision making.',
  OPPORTUNITY_SPOTTER:
    'Train pattern recognition by pointing to a hidden business opportunity in ordinary operational friction.',
  TEN_X_QUESTION:
    'Ask one powerful expansion question. Keep it concise and make the final sentence a direct question.',
  TODAYS_MOVE:
    'Give one concrete move the user can take today. Make it strategic and immediately usable.',
};

function normalizeWhitespace(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeForComparison(text) {
  return normalizeWhitespace(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(today s move|business idea|mindset shift|opportunity spotter|ten x question|10x question)\b/g, ' ')
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

function keywordSet(text) {
  return new Set(
    normalizeForComparison(text)
      .split(' ')
      .filter((word) => word && word.length > 3),
  );
}

function similarityScore(a, b) {
  const left = keywordSet(a);
  const right = keywordSet(b);

  if (!left.size || !right.size) {
    return 0;
  }

  let overlap = 0;
  for (const word of left) {
    if (right.has(word)) {
      overlap += 1;
    }
  }

  return overlap / Math.min(left.size, right.size);
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

function openingFragment(text) {
  return normalizeForComparison(text)
    .split(' ')
    .slice(0, 8)
    .join(' ');
}

function recentPromptReferences(recentInsights = []) {
  return recentInsights
    .map((item) => {
      if (!item) {
        return '';
      }

      if (typeof item === 'string') {
        return item;
      }

      return item.text || '';
    })
    .filter(Boolean)
    .slice(-MAX_RECENT_PROMPT_REFERENCES);
}

function rememberOutput(category, text) {
  RECENT_OUTPUTS.push({
    category,
    opening: openingFragment(text),
    text,
  });

  while (RECENT_OUTPUTS.length > MAX_RECENT_INSIGHTS) {
    RECENT_OUTPUTS.shift();
  }
}

function recentOutputsFor(category) {
  return RECENT_OUTPUTS.filter((item) => item.category === category).slice(-MAX_RECENT_PROMPT_REFERENCES);
}

function isTooSimilar(text, recentInsights = []) {
  const normalized = normalizeForComparison(text);
  const opening = openingFragment(text);

  return recentInsights.some((recent) => {
    const candidate = typeof recent === 'string' ? recent : recent.text;

    if (!candidate) {
      return false;
    }

    const recentNormalized = normalizeForComparison(candidate);

    return (
      normalized === recentNormalized ||
      opening === openingFragment(candidate) ||
      similarityScore(normalized, recentNormalized) >= 0.72
    );
  });
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

function randomChoice(list, fallback) {
  if (!Array.isArray(list) || !list.length) {
    return fallback;
  }

  return list[Math.floor(Math.random() * list.length)];
}

function buildPrompt({ category, recentInsights = [], attempt = 0 }) {
  const categoryLabel = CATEGORIES[category]?.promptLabel || CATEGORIES.TODAYS_MOVE.promptLabel;
  const categoryInstruction = CATEGORY_INSTRUCTIONS[category] || CATEGORY_INSTRUCTIONS.TODAYS_MOVE;
  const audienceLens = randomChoice(EVERYDAY_AUDIENCES, EVERYDAY_AUDIENCES[0]);
  const focusArea = randomChoice(CATEGORY_ANGLES[category], CATEGORY_ANGLES.TODAYS_MOVE[0]);
  const avoidReferences = recentPromptReferences(recentInsights);
  const noveltyDirective =
    attempt > 0
      ? 'Increase novelty. Change the framing, examples, and business surface dramatically from earlier attempts.'
      : 'Make the response feel fresh, concrete, and different from common business-coaching cliches.';

  return [
    'Write one response for an Alexa skill called Secret Billionaire.',
    `Category: ${categoryLabel}.`,
    'Voice: premium, noir, strategic, mysterious, practical, concise, high agency.',
    'Theme: leverage, ownership, systems, distribution, recurring revenue, scale, opportunity recognition, empire building.',
    `Target audience: ${audienceLens}.`,
    `Focus area for this response: ${focusArea}.`,
    `Category requirement: ${categoryInstruction}`,
    'Output: 1 to 3 sentences, 40 to 90 words, voice friendly, memorable, useful.',
    `Start with the exact label "${categoryLabel === "Today's Move" ? "Today's move" : CATEGORIES[category]?.label || "Today's move"}:".`,
    'Do not use bullet points, markdown, emojis, quotes, or citations.',
    'Do not sound generic, cheesy, spiritual, or like an Instagram motivation page.',
    'Prefer concrete verbs, simple nouns, and specific business mechanics over metaphor.',
    'Speak to real people building toward wealth from ordinary starting conditions. Use side hustles, local businesses, service offers, creator businesses, workflow problems, follow-up, packaging, systems, pricing, audience, and recurring revenue as your raw material.',
    'Avoid sounding like the user already owns a conglomerate, private equity firm, or multinational holding company.',
    'Do not default to buying companies, hiring executives, raising venture capital, or abstract empire language unless it is grounded in a move a normal ambitious user can act on now.',
    noveltyDirective,
    'Do not include illegal tactics, deception, fraud, market manipulation, insider trading, tax evasion, or personalized investment, legal, or tax advice.',
    ...(avoidReferences.length
      ? [
          `Avoid repeating or paraphrasing these recent ideas: ${avoidReferences.join(' || ')}.`,
        ]
      : []),
    'Return only the final spoken copy.',
  ].join(' ');
}

async function requestOpenRouterInsight({
  apiToken,
  category,
  prompt,
  fetchImpl = fetch,
  timeoutMs = Number(process.env.AI_REQUEST_TIMEOUT_MS || DEFAULT_REQUEST_TIMEOUT_MS),
  model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
}) {
  if (!apiToken) {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new Error('OPENROUTER_TIMEOUT')), timeoutMs);

  let response;

  try {
    response = await fetchImpl('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/swordfish444/secret-billionaire',
        'X-Title': 'Secret Billionaire',
      },
      body: JSON.stringify({
        model,
        temperature: 0.92,
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
            content: prompt || buildPrompt({ category }),
          },
        ],
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

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
  recentInsights = [],
} = {}) {
  const recent = [...recentOutputsFor(category), ...recentPromptReferences(recentInsights).map((text) => ({ text }))];
  const fallbackInsight =
    typeof fallback === 'function' ? fallback({ exclude: recent.map((item) => item.text) }) : String(fallback || '');

  if (!apiToken) {
    const preparedFallback = trimToVoiceLimits(ensureCategoryLead(fallbackInsight, category), {
      maxSentences,
      maxWords,
    });
    rememberOutput(category, preparedFallback);
    return preparedFallback;
  }

  try {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const generated = await requestOpenRouterInsight({
        apiToken,
        category,
        fetchImpl,
        prompt: buildPrompt({
          category,
          recentInsights: recent.map((item) => item.text),
          attempt,
        }),
      });

      const prepared = trimToVoiceLimits(ensureCategoryLead(generated || fallbackInsight, category), {
        maxSentences,
        maxWords,
      });

      if (!isTooSimilar(prepared, recent)) {
        rememberOutput(category, prepared);
        return prepared;
      }

      recent.push({ text: prepared });
    }
  } catch (error) {
    console.error('Secret Billionaire AI generation failed', error);
  }

  const preparedFallback = trimToVoiceLimits(ensureCategoryLead(fallbackInsight, category), {
    maxSentences,
    maxWords,
  });
  rememberOutput(category, preparedFallback);
  return preparedFallback;
}

module.exports = {
  DEFAULT_REQUEST_TIMEOUT_MS,
  DEFAULT_MAX_SENTENCES,
  DEFAULT_MAX_WORDS,
  buildPrompt,
  extractMessageContent,
  generateInsight,
  isTooSimilar,
  normalizeForComparison,
  recentOutputsFor,
  trimToVoiceLimits,
};
