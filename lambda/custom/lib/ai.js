const { CATEGORIES } = require('./content');

const DEFAULT_MODEL = 'moonshotai/kimi-k2.5';
const DEFAULT_MAX_SENTENCES = 3;
const DEFAULT_MAX_WORDS = 90;
const DEFAULT_REQUEST_TIMEOUT_MS = 5500;
const MAX_RECENT_INSIGHTS = 18;
const MAX_RECENT_PROMPT_REFERENCES = 6;
const EVERYDAY_AUDIENCES = [
  'a high school student with ambition and limited experience',
  'a college student trying to turn curiosity into real momentum',
  'a salaried professional trying to become more valuable and more independent',
  'a creator trying to build a stronger personal brand',
  'a freelancer trying to create leverage instead of only selling hours',
  'an early founder trying to move faster without a big team',
  'an ambitious person with limited time, limited cash, and plenty of upside',
];
const EVERYDAY_DOMAINS = [
  'studying and learning faster',
  'writing, messaging, and communication',
  'planning the week and making better decisions',
  'organizing notes, ideas, and research',
  'job searching and career growth',
  'content creation and building a personal brand',
  'turning a side project into real momentum',
  'handling everyday admin with less stress',
];
const CATEGORY_ANGLES = {
  BUSINESS_IDEA: [
    'AI prompt systems for everyday work',
    'AI services that save time for busy people',
    'AI brand-building support for creators and professionals',
    'AI workflows that turn messy notes into useful output',
    'AI assistance for planning, studying, and decision making',
    'AI automations that remove simple but repeated friction',
  ],
  MINDSET_SHIFT: [
    'treating AI like leverage instead of novelty',
    'using systems to outpace raw effort',
    'turning curiosity into execution faster',
    'building confidence through output instead of waiting',
    'thinking like an owner with simple tools',
    'compounding skill by capturing and reusing good work',
  ],
  OPPORTUNITY_SPOTTER: [
    'blank-page friction',
    'manual copy-paste work',
    'slow follow-up and weak communication',
    'people drowning in information without clarity',
    'overwhelmed students and professionals',
    'ordinary tasks that would improve with AI guidance',
  ],
  TEN_X_QUESTION: [
    'faster learning with AI',
    'building a personal brand with systems',
    'delegating first drafts and repetitive thinking',
    'turning a skill into something scalable',
    'using AI to create more shots on goal',
    'compounding output instead of reacting all day',
  ],
  TODAYS_MOVE: [
    'one AI action that saves time today',
    'one AI workflow that improves clarity',
    'one AI move that builds confidence through action',
    'one AI habit that turns ideas into assets',
    'one practical way to use AI for communication or planning',
    'one AI system that helps an ordinary ambitious person move faster',
  ],
};
const RESPONSE_SHAPES = [
  'a simple action the user can try today',
  'a hidden advantage the user can unlock with one better system',
  'a plain-language reframe that makes AI feel usable right now',
  'a before-and-after contrast between manual effort and AI leverage',
  'a specific pattern ordinary ambitious people can copy immediately',
  'a concrete way to turn messy input into useful output',
];
const RECENT_OUTPUTS = [];
const CATEGORY_INSTRUCTIONS = {
  BUSINESS_IDEA:
    'State a simple AI-enabled offer, product, service, or workflow. Include the problem, the solution, and why it could scale. Keep it approachable for beginners.',
  MINDSET_SHIFT:
    'Deliver one sharp reframe about AI leverage, systems, ownership, speed, or compounding. It should feel empowering, not intimidating.',
  OPPORTUNITY_SPOTTER:
    'Point to an ordinary place where AI can remove friction, increase output, or create new value. Make the opportunity easy to recognize.',
  TEN_X_QUESTION:
    'Ask one powerful question about using AI, systems, or leverage to expand the user’s future. Keep the final sentence a direct question.',
  TODAYS_MOVE:
    'Give one simple AI-powered move the user can take today. It must be specific, practical, and realistic for almost anyone.',
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
  const normalized = normalizeWhitespace(text)
    .replace(/[*_`#]+/g, '')
    .replace(/^secret billionaire[.!?,:\s-]*/i, '');
  const collapsedLead = normalized.replace(
    new RegExp(`^(?:${escapeRegExp(label)}\\s*:\\s*)+`, 'i'),
    `${label}: `,
  );

  if (leadPattern.test(collapsedLead)) {
    return collapsedLead;
  }

  return `${label}: ${collapsedLead}`;
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
      similarityScore(normalized, recentNormalized) >= 0.68
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
  const everydayDomain = randomChoice(EVERYDAY_DOMAINS, EVERYDAY_DOMAINS[0]);
  const focusArea = randomChoice(CATEGORY_ANGLES[category], CATEGORY_ANGLES.TODAYS_MOVE[0]);
  const responseShape = randomChoice(RESPONSE_SHAPES, RESPONSE_SHAPES[0]);
  const avoidReferences = recentPromptReferences(recentInsights);
  const noveltyDirective =
    attempt > 0
      ? 'Increase novelty. Change the framing, use a different situation, and avoid repeating the same advice shape or opening words.'
      : 'Make the response feel fresh, practical, and different from generic motivational advice.';

  return [
    'Write one response for an Alexa skill called Secret Billionaire.',
    `Category: ${categoryLabel}.`,
    'Voice: premium, noir, strategic, mysterious, practical, concise, high agency.',
    'Theme: AI leverage, systems, ownership, speed, compounding, useful output, opportunity recognition, and empire building through modern tools.',
    `Target audience: ${audienceLens}.`,
    `Everyday domain for this response: ${everydayDomain}.`,
    `Focus area for this response: ${focusArea}.`,
    `Response shape for this turn: ${responseShape}.`,
    `Category requirement: ${categoryInstruction}`,
    'Output: 1 to 3 sentences, 40 to 90 words, voice friendly, memorable, useful.',
    `Start with the exact label "${categoryLabel === "Today's Move" ? "Today's move" : CATEGORIES[category]?.label || "Today's move"}:".`,
    'Make it simple enough that a smart high school student could understand it and act on it.',
    'Keep it broadly applicable to students, employees, creators, freelancers, and early builders. Make it feel useful to almost anyone with ambition.',
    'Center the advice on how AI, agentic AI, automation, or AI-native tools can help the user think better, move faster, communicate more clearly, build useful assets, or spot opportunities.',
    'Mention AI, an AI tool, or an AI agent explicitly in the first sentence.',
    'Keep the example anchored in the everyday domain above unless a broader frame is absolutely necessary.',
    'Default to examples from school, work, side projects, content creation, planning, communication, and everyday productivity before using company-scale or leadership-heavy examples.',
    'Avoid executive, enterprise, or boardroom framing unless it stays immediately relatable to a beginner.',
    'Do not mention specific AI brand names unless absolutely necessary.',
    'Avoid narrow industry examples, niche jargon, heavy operational complexity, or assumptions about large teams, big budgets, venture capital, or owning multiple companies.',
    'Do not use bullet points, markdown, emojis, quotes, or citations.',
    'Do not repeat the category label more than once.',
    'Do not sound generic, cheesy, spiritual, intimidating, or like an Instagram motivation page.',
    'Prefer concrete verbs, simple nouns, and a clear next action over theory.',
    noveltyDirective,
    'Do not include illegal tactics, deception, fraud, market manipulation, insider trading, tax evasion, or personalized investment, legal, or tax advice.',
    ...(avoidReferences.length
      ? [`Avoid repeating or paraphrasing these recent ideas: ${avoidReferences.join(' || ')}.`]
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
        temperature: 1,
        max_tokens: 180,
        reasoning: {
          effort: 'none',
          exclude: true,
        },
        messages: [
          {
            role: 'system',
            content:
              'You write sharp spoken micro-coaching for Alexa. Keep every answer compact, practical, ethical, distinct, and easy to act on.',
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
