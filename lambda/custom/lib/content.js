const CATEGORIES = {
  BUSINESS_IDEA: {
    label: 'Business idea',
    promptLabel: 'Business Idea',
    repromptLabel: 'business idea',
    suggestionLabel: 'a business idea',
  },
  MINDSET_SHIFT: {
    label: 'Mindset shift',
    promptLabel: 'Mindset Shift',
    repromptLabel: 'mindset shift',
    suggestionLabel: 'a mindset shift',
  },
  OPPORTUNITY_SPOTTER: {
    label: 'Opportunity spotter',
    promptLabel: 'Opportunity Spotter',
    repromptLabel: 'opportunity spotter',
    suggestionLabel: 'an opportunity spotter',
  },
  TEN_X_QUESTION: {
    label: '10X question',
    promptLabel: '10X Question',
    repromptLabel: 'ten X question',
    suggestionLabel: 'a ten X question',
  },
  TODAYS_MOVE: {
    label: "Today's move",
    promptLabel: "Today's Move",
    repromptLabel: "today's move",
    suggestionLabel: "today's move",
  },
};

const FALLBACK_INSIGHTS = {
  TODAYS_MOVE: [
    "Today's move: take one task that drains your energy, then ask an AI tool to give you a first draft, checklist, or summary for it. You are training yourself to stop doing everything from scratch.",
    "Today's move: pick one idea you have been sitting on and ask AI to turn it into a simple one-page plan. Action gets easier when the next three steps are visible.",
    "Today's move: save one prompt that helps you think, write, or organize faster. The people who win with AI build reusable systems, not one-off experiments.",
    "Today's move: ask AI to rewrite one email, post, or pitch so it sounds clearer and more confident. Better communication is leverage, even before you build a business.",
    "Today's move: feed AI your messy notes from school, work, or a side project and ask for the three most useful next actions. Clear direction beats more motivation.",
    "Today's move: turn one repeated task into a template today. Every time you remove setup friction, you create more room for real opportunity.",
    "Today's move: ask AI what part of your week should be automated, delegated, or simplified first. Real leverage starts when you protect your attention instead of spending it on the same task over and over.",
    "Today's move: choose one skill people already come to you for and ask AI to help you package it into a beginner-friendly offer, guide, or service. Simplicity is what makes expertise scalable.",
  ],
  MINDSET_SHIFT: [
    "Mindset shift: AI is not here to replace your ambition. It is here to multiply your speed, your clarity, and the number of shots you can take in a week.",
    "Mindset shift: you do not need to sound like an expert on day one. You need to learn faster than average and use tools that help you move before doubt slows you down.",
    "Mindset shift: the real advantage is not knowing everything yourself. It is knowing how to direct systems that help you think, create, and execute better.",
    "Mindset shift: leverage starts when you stop asking, can I do this alone, and start asking, what could I build with the right tools helping me?",
    "Mindset shift: most people use AI for convenience. The edge comes when you use it to increase output, sharpen judgment, and turn your effort into repeatable assets.",
    "Mindset shift: being early matters less than being consistent. Someone with ordinary talent and strong systems usually beats someone with big ideas and no execution rhythm.",
    "Mindset shift: the modern empire starts with attention and useful output. If you can create value faster than most people can organize themselves, you already have an edge.",
    "Mindset shift: you do not need billionaire resources to think bigger. You need the habit of turning ideas into drafts, drafts into systems, and systems into momentum.",
  ],
  BUSINESS_IDEA: [
    "Business idea: offer an AI setup service for students, freelancers, or small teams who want custom prompts and workflows. The problem is wasted time and weak output, the solution is a simple AI operating system, and it scales because the same patterns work for many people.",
    "Business idea: build a service that turns rough voice notes into polished posts, emails, or newsletters. The problem is people have ideas but no time to shape them, the solution is AI-assisted content packaging, and it scales through repeatable templates.",
    "Business idea: create a weekly AI productivity brief for busy people trying to learn faster and stay organized. The problem is tool overload, the solution is one curated workflow plus one useful prompt each week, and it scales through subscriptions and lightweight community.",
    "Business idea: package an AI brand accelerator for creators and local business owners. The problem is inconsistent messaging, the solution is done-with-you content and prompt systems, and it scales because every audience builder needs speed and clarity.",
    "Business idea: launch a micro agency that helps small businesses automate lead follow-up with AI. The problem is revenue leaks after interest shows up, the solution is a simple response workflow, and it scales across many service businesses.",
    "Business idea: build a niche research assistant for people exploring side hustles, careers, or content ideas. The problem is scattered information, the solution is AI-guided research packs, and it scales because everyone wants faster clarity before they commit.",
    "Business idea: create an AI-powered study and planning tool for students and early-career builders. The problem is mental overload, the solution is instant breakdowns and action plans, and it scales because focus is a universal pain point.",
    "Business idea: offer AI workflow audits for individuals who want to save time before they hire anyone. The problem is too much manual work, the solution is a cleaner personal system, and it scales because efficiency is valuable long before a company is large.",
  ],
  TEN_X_QUESTION: [
    '10X question: if AI handled the first draft of your thinking every day, what bigger problem could you finally spend your energy solving?',
    '10X question: what part of your current life could become a real advantage if you used AI to learn, create, or respond twice as fast?',
    '10X question: which skill do people already trust you for, and how could AI help you turn it into something useful for more than one person at a time?',
    '10X question: if you had to build momentum without more confidence, what could AI help you start before you feel fully ready?',
    '10X question: where are you still trading raw time for progress when a better system could be compounding for you instead?',
    '10X question: what would change in your life if your ideas stopped dying in notes and started becoming polished output within the same day?',
    '10X question: if you treated AI like a teammate instead of a toy, what would you ask it to own every week?',
    '10X question: what future version of you would exist if you learned how to turn curiosity into action faster than almost anyone you know?',
  ],
  OPPORTUNITY_SPOTTER: [
    'Opportunity spotter: notice every place where people stare at a blank page before they start. Blank-page friction is one of the cleanest openings for AI-powered help.',
    'Opportunity spotter: pay attention to tasks people keep postponing because they feel messy, boring, or mentally heavy. AI becomes valuable wherever momentum dies before action starts.',
    'Opportunity spotter: watch for people copying information between apps, tabs, and notes. Manual handoffs are often hidden opportunities for simple AI workflows.',
    'Opportunity spotter: listen for anyone saying they have ideas but no system. The gap between intention and organized execution is where modern leverage lives.',
    'Opportunity spotter: look for groups who need better communication but do not want more meetings. AI can create huge value by shortening explanation time.',
    'Opportunity spotter: when someone keeps asking, can you help me word this, summarize this, or figure this out, you are looking at repeatable demand.',
    'Opportunity spotter: notice where people consume lots of information but struggle to turn it into decisions. Translation from input to action is a strong AI opportunity.',
    'Opportunity spotter: whenever a person is capable but overwhelmed, there is usually room for a tool, service, or system that gives them a cleaner next move.',
  ],
};

const FOLLOW_UP_OPTIONS = {
  BUSINESS_IDEA: ['TODAYS_MOVE', 'TEN_X_QUESTION', 'OPPORTUNITY_SPOTTER'],
  MINDSET_SHIFT: ['TODAYS_MOVE', 'TEN_X_QUESTION', 'BUSINESS_IDEA'],
  OPPORTUNITY_SPOTTER: ['TODAYS_MOVE', 'TEN_X_QUESTION', 'MINDSET_SHIFT'],
  TEN_X_QUESTION: ['TODAYS_MOVE', 'OPPORTUNITY_SPOTTER', 'MINDSET_SHIFT'],
  TODAYS_MOVE: ['MINDSET_SHIFT', 'OPPORTUNITY_SPOTTER', 'BUSINESS_IDEA'],
};

function randomFromList(list, exclude = []) {
  const blocked = new Set(exclude);
  const filtered = list.filter((item) => !blocked.has(item));
  const pool = filtered.length ? filtered : list;
  return pool[Math.floor(Math.random() * pool.length)];
}

function fallbackInsightFor(category, { exclude = [] } = {}) {
  return randomFromList(FALLBACK_INSIGHTS[category] || FALLBACK_INSIGHTS.TODAYS_MOVE, exclude);
}

function nextCategoryFor(category, { exclude = [] } = {}) {
  const options = FOLLOW_UP_OPTIONS[category] || FOLLOW_UP_OPTIONS.TODAYS_MOVE;
  return randomFromList(options, exclude);
}

function suggestionLabelFor(category) {
  return CATEGORIES[category]?.suggestionLabel || CATEGORIES.TODAYS_MOVE.suggestionLabel;
}

module.exports = {
  CATEGORIES,
  fallbackInsightFor,
  nextCategoryFor,
  suggestionLabelFor,
};
