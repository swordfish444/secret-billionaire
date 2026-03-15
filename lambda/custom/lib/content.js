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
    "Today's move: write down the last three things people asked you for help with. If the same problem appears twice, you may already be standing on a sellable offer.",
    "Today's move: time one task you repeat every week. If it steals more than thirty minutes, turn it into a checklist, template, or small automation before you do it again.",
    "Today's move: ask one friend, customer, or coworker what part of their week feels unnecessarily manual. Recurring friction is where useful businesses begin.",
    "Today's move: find one service you deliver informally and package it into a simple fixed-price offer. Clarity converts faster than custom ambiguity.",
    "Today's move: list the tools, contacts, or audience access you already control. Wealth usually starts by using existing leverage better, not by waiting for permission.",
    "Today's move: look at the task people always procrastinate but still must finish. If you can make that easier, you are close to something people will pay for.",
    "Today's move: choose one process in your work that only needs your standards, not your hands. Document it once and you stop paying for it with your time forever.",
    "Today's move: check what people complain about right before they spend money. Pain closest to a purchase decision is often the easiest pain to monetize.",
  ],
  MINDSET_SHIFT: [
    "Mindset shift: you do not need a giant company to think like an owner. You need to stop asking how to stay busy and start asking what keeps paying when you are offline.",
    "Mindset shift: most people chase more income streams too early. One clean repeatable offer with real demand beats five scattered ideas every time.",
    "Mindset shift: leverage is not only money or code. A template, a reputation, a niche audience, or a proven process can all multiply your next move.",
    "Mindset shift: progress comes faster when you stop glorifying effort and start measuring repeatability. If a win cannot be repeated, it cannot compound.",
    "Mindset shift: ownership starts the moment you build something people return to without needing a fresh explanation from you each time.",
    "Mindset shift: the goal is not to sound bigger. The goal is to become easier to buy, easier to trust, and easier to repeat.",
    "Mindset shift: people overestimate originality and underestimate observation. Better businesses often come from noticing what frustrates normal people every week.",
    "Mindset shift: the smartest growth question is not what else can I add. It is what already works that deserves more reach, automation, or pricing power.",
  ],
  BUSINESS_IDEA: [
    "Business idea: build a done-for-you reminder and follow-up service for local businesses that still miss quotes and callbacks. The problem is lost revenue from slow follow-up, the solution is a lightweight response system, and it scales by templating the same workflow across trades.",
    "Business idea: create a simple weekly numbers brief for solo business owners who hate spreadsheets. The problem is they cannot see what is working, the solution is one clear dashboard and summary, and it scales as a recurring subscription.",
    "Business idea: offer a niche onboarding package for agencies or consultants who keep reinventing client setup. The problem is inconsistent delivery, the solution is a repeatable onboarding system, and it scales through templates plus lightweight automation.",
    "Business idea: build a micro tool that turns messy voice notes into action lists for contractors, founders, or creators. The problem is ideas stay trapped in recordings, the solution is instant structure, and it scales because the workflow is common across industries.",
    "Business idea: launch a review-reactivation service for businesses with old happy customers but weak referral flow. The problem is dormant trust, the solution is a system that revives testimonials and referrals, and it scales through simple recurring outreach.",
    "Business idea: create a quote-and-scheduling assistant for high-ticket freelancers. The problem is slow back-and-forth before the sale, the solution is one streamlined booking flow, and it scales because every operator with custom work faces the same bottleneck.",
    "Business idea: build a recurring cleanup service for small teams drowning in disconnected tools. The problem is duplicated admin work, the solution is monthly workflow simplification, and it scales by productizing the same audits and fixes.",
    "Business idea: create a local business intelligence brief that shows owners what competitors are charging, promoting, and neglecting. The problem is blind decision making, the solution is a monthly strategic snapshot, and it scales city by city and niche by niche.",
  ],
  TEN_X_QUESTION: [
    "10X question: if you had to grow your income without adding more working hours, what would you be forced to package, automate, or delegate first?",
    "10X question: what do people already trust you for that could become a simple offer instead of a recurring favor?",
    "10X question: where are you still creating value one conversation at a time when a system could be doing the first eighty percent for you?",
    "10X question: if your current path stayed exactly the same for two years, what part of it would still fail to compound?",
    "10X question: what does your customer struggle with before they buy from you, and why do you not own that part of the journey yet?",
    "10X question: which part of your week feels small to you but would save someone else money, stress, or time immediately?",
    "10X question: if you had to become known for solving one profitable problem in one niche, which problem would you choose and why?",
    "10X question: what asset could you build once this quarter that would still help you sell, serve, or attract trust next year?",
  ],
  OPPORTUNITY_SPOTTER: [
    "Opportunity spotter: look for any business that relies on sticky notes, inbox flags, or memory to keep money from slipping away. Forgotten follow-up is often a product opportunity in disguise.",
    "Opportunity spotter: notice where normal people keep saying, I know I should do this, but I never get around to it. Repeated avoidance often signals a business worth building.",
    "Opportunity spotter: when a process requires a screen recording just to explain it, there is usually room for a clearer product, service, or automation.",
    "Opportunity spotter: listen for phrases like, I always have to check three places for that. Fragmented information is one of the cleanest paths to a useful tool.",
    "Opportunity spotter: watch for businesses that are busy but still slow. Bottlenecks inside demand are better than ideas without demand.",
    "Opportunity spotter: anytime you see a person manually rewriting the same message for customers, leads, or staff, you are probably looking at monetizable friction.",
    "Opportunity spotter: pay attention to what people complain about paying for, not just what they complain about using. Annoying expenses are where better offers can win fast.",
    "Opportunity spotter: if a local operator says every day is different but the problems sound the same, there is probably a repeatable solution hiding under the chaos.",
  ],
};

const FOLLOW_UP_OPTIONS = {
  BUSINESS_IDEA: ['TODAYS_MOVE', 'OPPORTUNITY_SPOTTER', 'MINDSET_SHIFT'],
  MINDSET_SHIFT: ['TODAYS_MOVE', 'TEN_X_QUESTION', 'BUSINESS_IDEA'],
  OPPORTUNITY_SPOTTER: ['BUSINESS_IDEA', 'TODAYS_MOVE', 'MINDSET_SHIFT'],
  TEN_X_QUESTION: ['TODAYS_MOVE', 'MINDSET_SHIFT', 'BUSINESS_IDEA'],
  TODAYS_MOVE: ['MINDSET_SHIFT', 'BUSINESS_IDEA', 'TEN_X_QUESTION'],
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
