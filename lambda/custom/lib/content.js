const CATEGORIES = {
  BUSINESS_IDEA: {
    label: 'Business idea',
    promptLabel: 'Business Idea',
    repromptLabel: 'business idea',
  },
  MINDSET_SHIFT: {
    label: 'Mindset shift',
    promptLabel: 'Mindset Shift',
    repromptLabel: 'mindset shift',
  },
  OPPORTUNITY_SPOTTER: {
    label: 'Opportunity spotter',
    promptLabel: 'Opportunity Spotter',
    repromptLabel: 'opportunity spotter',
  },
  TEN_X_QUESTION: {
    label: '10X question',
    promptLabel: '10X Question',
    repromptLabel: 'ten X question',
  },
  TODAYS_MOVE: {
    label: "Today's move",
    promptLabel: "Today's Move",
    repromptLabel: "today's move",
  },
};

const FALLBACK_INSIGHTS = {
  TODAYS_MOVE: [
    "Today's move: audit one recurring task you still do by hand. If it happens every week, it deserves a system, not more of your time.",
    "Today's move: call one customer, prospect, or operator and ask what slows them down every month. Recurring pain is where recurring revenue begins.",
    "Today's move: find the step in your work that creates results but does not require your judgment. Standardize that step and buy your attention back.",
    "Today's move: write down the one bottleneck that caps your growth right now. Do not attack five problems. Remove the gate and the rest starts moving.",
    "Today's move: review where money enters your world and where trust enters your world. The highest-leverage business usually sits where those two already meet.",
    "Today's move: list your last five wins and circle the one that could be packaged, repeated, or licensed. Wealth compounds when a result stops depending on your calendar.",
  ],
  MINDSET_SHIFT: [
    "Mindset shift: rich operators do not chase more effort. They chase assets, systems, and distribution that keep working after the day ends.",
    "Mindset shift: if a decision only improves this week, it is probably too small. Build for the machine you want to own, not just the fire you want to put out.",
    "Mindset shift: growth rarely comes from adding complexity first. It usually comes from removing friction where value is already trying to move.",
    "Mindset shift: cash flow matters, but control matters more. The closer you are to the customer, the more options you own.",
    "Mindset shift: a billionaire lens is not asking how to do more. It is asking what can be multiplied without multiplying your attention.",
    "Mindset shift: the game changes when you stop selling hours and start owning the path customers return to by default.",
  ],
  BUSINESS_IDEA: [
    "Business idea: build a service that monitors expensive software subscriptions for small companies and flags waste each month. The problem is silent spend, the solution is continuous savings, and it scales through simple reporting plus recurring retainers.",
    "Business idea: create an AI-assisted response desk for home service businesses that miss inbound leads after hours. The problem is lost revenue, the solution is instant qualification and booking, and it scales across repeatable local verticals.",
    "Business idea: offer a lightweight compliance checklist platform for niche operators with ugly spreadsheet workflows. The problem is manual risk tracking, the solution is structured recurring workflows, and it scales because every operator in the niche shares the same burden.",
    "Business idea: build a quoting tool for custom manufacturers that turn drawings into faster estimates. The problem is slow sales cycles, the solution is clearer pricing workflows, and it scales by becoming the system buyers rely on before production.",
    "Business idea: launch a reputation-recovery service for businesses with poor follow-up after negative reviews. The problem is churn hidden in public trust, the solution is a repeatable customer recovery engine, and it scales with templates, automation, and niche focus.",
    "Business idea: create a signal dashboard for e-commerce brands that ties inventory, ad performance, and margin into one daily brief. The problem is fragmented decisions, the solution is one operating view, and it scales as a subscription across brands with similar pain.",
  ],
  TEN_X_QUESTION: [
    "10X question: what part of your business would still create value if you disappeared for thirty days, and why is that not the center of your strategy yet?",
    "10X question: if you had to double revenue without adding headcount, which lever would you be forced to redesign first?",
    "10X question: what does your customer repeatedly pay for after the sale, and how can you own more of that loop?",
    "10X question: where are you still custom-building something the market clearly wants packaged?",
    "10X question: which decision are you delaying because you are measuring comfort instead of leverage?",
    "10X question: if a larger competitor copied your offer tomorrow, what advantage would still remain yours to scale?",
  ],
  OPPORTUNITY_SPOTTER: [
    "Opportunity spotter: watch for any business that still depends on someone remembering to follow up manually. That gap is often a product disguised as an annoyance.",
    "Opportunity spotter: look for processes people explain with three different screenshots and an apology. Confusion with budget is an opportunity waiting for a cleaner system.",
    "Opportunity spotter: pay attention to where owners say, nobody on my team does this the same way. Inconsistency is often the front door to a scalable tool.",
    "Opportunity spotter: notice what businesses keep solving in Slack, text threads, and spreadsheets instead of software. That usually means the market pain is real and underserved.",
    "Opportunity spotter: when someone says, I lose deals because I cannot respond fast enough, you are staring at a revenue leak, not just an inconvenience.",
    "Opportunity spotter: any recurring task that requires copying data between two tools is worth studying. Friction repeated at scale is often where value hides.",
  ],
};

function randomFromList(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function fallbackInsightFor(category) {
  return randomFromList(FALLBACK_INSIGHTS[category] || FALLBACK_INSIGHTS.TODAYS_MOVE);
}

module.exports = {
  CATEGORIES,
  fallbackInsightFor,
};
