const Alexa = require('ask-sdk-core');

const { decorateResponseBuilder } = require('./lib/apl');
const { generateInsight } = require('./lib/ai');
const {
  CATEGORIES,
  fallbackInsightFor,
  nextCategoryFor,
  suggestionLabelFor,
} = require('./lib/content');

const MAX_SESSION_HISTORY = 6;
const MAX_GUIDED_TURNS = 5;
const DEFAULT_CATEGORY = 'TODAYS_MOVE';

function buildVisualResponse(
  handlerInput,
  {
    footer,
    shouldEndSession = false,
    reprompt,
    speech,
    subtitle = speech,
    title = 'Secret Billionaire',
  },
) {
  const responseBuilder = handlerInput.responseBuilder.speak(speech);

  if (reprompt && !shouldEndSession) {
    responseBuilder.reprompt(reprompt);
  }

  responseBuilder.withShouldEndSession(shouldEndSession);

  decorateResponseBuilder(handlerInput, responseBuilder, {
    footer,
    subtitle,
    title,
  });

  return responseBuilder.getResponse();
}

function sessionAttributes(handlerInput) {
  const attributes = handlerInput.attributesManager.getSessionAttributes();
  return attributes && typeof attributes === 'object' ? attributes : {};
}

function saveSessionAttributes(handlerInput, attributes) {
  handlerInput.attributesManager.setSessionAttributes(attributes);
}

function sessionHistory(attributes, key) {
  return Array.isArray(attributes[key]) ? attributes[key] : [];
}

function pushSessionHistory(attributes, key, value) {
  const next = [...sessionHistory(attributes, key), value].slice(-MAX_SESSION_HISTORY);
  attributes[key] = next;
}

function clearFollowUpState(attributes) {
  delete attributes.pendingFollowUp;
  delete attributes.suggestedCategory;
  delete attributes.followUpPrompt;
  delete attributes.followUpSourceCategory;
  delete attributes.lastPromptId;
}

function setFollowUpState(attributes, category, suggestedCategory) {
  attributes.currentCategory = category;
  attributes.pendingFollowUp = true;
  attributes.suggestedCategory = suggestedCategory;
  attributes.followUpSourceCategory = category;
  attributes.lastPromptId = `${category}-${Date.now()}`;
}

function followUpQuestion(category) {
  return `Would you like ${suggestionLabelFor(category)} next? Just say yes or no.`;
}

function capabilityList() {
  return "You can ask for today's move, a mindset shift, a business idea, a ten X question, or an opportunity spotter.";
}

function requestMetadata(handlerInput) {
  const request = handlerInput.requestEnvelope?.request || {};
  const session = handlerInput.requestEnvelope?.session || {};
  const interfaces = handlerInput.requestEnvelope?.context?.System?.device?.supportedInterfaces || {};

  return {
    dialogState: request.dialogState || null,
    hasApl: Boolean(interfaces['Alexa.Presentation.APL']),
    intentName: request.intent?.name || null,
    locale: request.locale || null,
    requestId: request.requestId || null,
    requestType: request.type || null,
    sessionId: session.sessionId || null,
    sessionNew: Boolean(session.new),
  };
}

function sessionDebugState(attributes) {
  return {
    currentCategory: attributes.currentCategory || null,
    followUpPrompt: attributes.followUpPrompt || null,
    followUpSourceCategory: attributes.followUpSourceCategory || null,
    lastPromptId: attributes.lastPromptId || null,
    pendingFollowUp: Boolean(attributes.pendingFollowUp),
    recentCategories: sessionHistory(attributes, 'recentCategories').slice(-3),
    recentInsightsCount: sessionHistory(attributes, 'recentInsights').length,
    suggestedCategory: attributes.suggestedCategory || null,
    turnCount: Number(attributes.turnCount || 0),
  };
}

function preview(text, length = 180) {
  if (!text) {
    return null;
  }

  return text.length > length ? `${text.slice(0, length)}...` : text;
}

function logSkillEvent(handlerInput, eventName, details = {}) {
  const attributes = sessionAttributes(handlerInput);
  const metadata = requestMetadata(handlerInput);

  console.log(
    JSON.stringify({
      ...metadata,
      event: eventName,
      sessionState: sessionDebugState(attributes),
      ...details,
    }),
  );
}

function nextCategory(attributes, category, explicitSuggestion) {
  if (explicitSuggestion) {
    return explicitSuggestion;
  }

  const recentCategories = sessionHistory(attributes, 'recentCategories');
  const exclude = [
    category,
    attributes.suggestedCategory,
    ...recentCategories.slice(-3),
  ].filter(Boolean);

  return nextCategoryFor(category, { exclude });
}

async function insightResponse(handlerInput, category, options = {}) {
  const attributes = sessionAttributes(handlerInput);
  const recentInsights = sessionHistory(attributes, 'recentInsights');
  const insight = await generateInsight({
    category,
    fallback: ({ exclude } = {}) => fallbackInsightFor(category, { exclude }),
    recentInsights,
  });
  const suggestedCategory = nextCategory(attributes, category, options.suggestedCategory);
  const nextQuestion = followUpQuestion(suggestedCategory);

  pushSessionHistory(attributes, 'recentCategories', category);
  pushSessionHistory(attributes, 'recentInsights', insight);
  attributes.turnCount = Number(attributes.turnCount || 0) + 1;
  const shouldEndSession = attributes.turnCount >= MAX_GUIDED_TURNS;

  if (shouldEndSession) {
    clearFollowUpState(attributes);
  } else {
    setFollowUpState(attributes, category, suggestedCategory);
    attributes.followUpPrompt = nextQuestion;
  }
  saveSessionAttributes(handlerInput, attributes);

  logSkillEvent(handlerInput, 'insight_response', {
    categorySource: options.categorySource || 'implicit',
    deliveredCategory: category,
    deliveredInsightPreview: preview(insight),
    maxGuidedTurns: MAX_GUIDED_TURNS,
    nextPromptPreview: shouldEndSession ? null : preview(nextQuestion),
    responseIntro: options.intro || null,
    shouldEndSession,
  });

  const speech = shouldEndSession
    ? [options.intro, insight, 'That is enough for one session. Build your empire. One move at a time.']
      .filter(Boolean)
      .join(' ')
    : [options.intro, insight, nextQuestion].filter(Boolean).join(' ');

  return buildVisualResponse(handlerInput, {
    footer: shouldEndSession
      ? 'That is enough for one session. Build your empire. One move at a time.'
      : options.footer || nextQuestion,
    reprompt: shouldEndSession ? undefined : options.reprompt || nextQuestion,
    shouldEndSession,
    speech,
    subtitle: insight,
  });
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  async handle(handlerInput) {
    logSkillEvent(handlerInput, 'launch_request');

    return insightResponse(handlerInput, DEFAULT_CATEGORY, {
      categorySource: 'launch_default',
      intro: 'Welcome to Secret Billionaire.',
    });
  },
};

function intentHandler(intentName, category) {
  return {
    canHandle(handlerInput) {
      return (
        Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
        Alexa.getIntentName(handlerInput.requestEnvelope) === intentName
      );
    },
    async handle(handlerInput) {
      logSkillEvent(handlerInput, 'explicit_category_request', {
        categorySource: 'explicit_intent',
        deliveredCategory: category,
      });

      return insightResponse(handlerInput, category, {
        categorySource: 'explicit_intent',
      });
    },
  };
}

const GetTodaysMoveIntentHandler = intentHandler('GetTodaysMoveIntent', 'TODAYS_MOVE');
const GetMindsetShiftIntentHandler = intentHandler('GetMindsetShiftIntent', 'MINDSET_SHIFT');
const GetBusinessIdeaIntentHandler = intentHandler('GetBusinessIdeaIntent', 'BUSINESS_IDEA');
const GetTenXQuestionIntentHandler = intentHandler('GetTenXQuestionIntent', 'TEN_X_QUESTION');
const GetOpportunitySpotterIntentHandler = intentHandler(
  'GetOpportunitySpotterIntent',
  'OPPORTUNITY_SPOTTER',
);

const GetAnotherInsightIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetAnotherInsightIntent'
    );
  },
  async handle(handlerInput) {
    const attributes = sessionAttributes(handlerInput);
    const category =
      (attributes.pendingFollowUp && attributes.suggestedCategory) ||
      nextCategory(attributes, attributes.currentCategory || DEFAULT_CATEGORY);
    const categorySource = attributes.pendingFollowUp ? 'pending_follow_up' : 'rotation';

    logSkillEvent(handlerInput, 'another_insight_request', {
      categorySource,
      deliveredCategory: category,
    });

    return insightResponse(handlerInput, category, {
      categorySource,
    });
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
    );
  },
  handle(handlerInput) {
    const attributes = sessionAttributes(handlerInput);
    const suggestedCategory = DEFAULT_CATEGORY;
    const nextQuestion = followUpQuestion(suggestedCategory);

    setFollowUpState(attributes, attributes.currentCategory || DEFAULT_CATEGORY, suggestedCategory);
    attributes.followUpPrompt = nextQuestion;
    saveSessionAttributes(handlerInput, attributes);

    logSkillEvent(handlerInput, 'help_request', {
      nextPromptPreview: preview(nextQuestion),
    });

    return buildVisualResponse(handlerInput, {
      footer: nextQuestion,
      reprompt: nextQuestion,
      speech:
        `Secret Billionaire gives you short AI-powered moves for life, work, learning, and building leverage. ${capabilityList()} ${nextQuestion}`,
      subtitle:
        "Short AI-powered moves for life, work, learning, and building leverage.",
    });
  },
};

const NoIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent'
    );
  },
  handle(handlerInput) {
    const attributes = sessionAttributes(handlerInput);
    clearFollowUpState(attributes);
    saveSessionAttributes(handlerInput, attributes);

    logSkillEvent(handlerInput, 'no_intent_end');

    return handlerInput.responseBuilder
      .speak('Understood. Build your empire. One move at a time.')
      .withShouldEndSession(true)
      .getResponse();
  },
};

const YesIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent'
    );
  },
  async handle(handlerInput) {
    const attributes = sessionAttributes(handlerInput);
    const category =
      (attributes.pendingFollowUp && attributes.suggestedCategory) ||
      DEFAULT_CATEGORY;
    const categorySource = attributes.pendingFollowUp ? 'pending_follow_up' : 'default_yes';

    logSkillEvent(handlerInput, 'yes_intent_continue', {
      categorySource,
      deliveredCategory: category,
    });

    return insightResponse(handlerInput, category, {
      categorySource,
    });
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      ['AMAZON.CancelIntent', 'AMAZON.StopIntent'].includes(Alexa.getIntentName(handlerInput.requestEnvelope))
    );
  },
  handle(handlerInput) {
    const attributes = sessionAttributes(handlerInput);
    clearFollowUpState(attributes);
    saveSessionAttributes(handlerInput, attributes);

    logSkillEvent(handlerInput, 'cancel_or_stop');

    return handlerInput.responseBuilder
      .speak('Understood. Build your empire. One move at a time.')
      .withShouldEndSession(true)
      .getResponse();
  },
};

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent'
    );
  },
  handle(handlerInput) {
    const attributes = sessionAttributes(handlerInput);
    const suggestedCategory = attributes.suggestedCategory || DEFAULT_CATEGORY;
    const nextQuestion = followUpQuestion(suggestedCategory);
    const speech = attributes.pendingFollowUp
      ? `Say yes for ${suggestionLabelFor(suggestedCategory)}, or ask for another category directly. ${capabilityList()}`
      : `${capabilityList()} ${nextQuestion}`;

    attributes.followUpPrompt = nextQuestion;
    if (!attributes.pendingFollowUp) {
      setFollowUpState(attributes, attributes.currentCategory || DEFAULT_CATEGORY, suggestedCategory);
    }
    saveSessionAttributes(handlerInput, attributes);

    logSkillEvent(handlerInput, 'fallback', {
      nextPromptPreview: preview(nextQuestion),
      speechPreview: preview(speech),
    });

    return buildVisualResponse(handlerInput, {
      footer: nextQuestion,
      reprompt: nextQuestion,
      speech,
      subtitle: capabilityList(),
    });
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    logSkillEvent(handlerInput, 'session_ended');
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error('Secret Billionaire skill error', error);

    return buildVisualResponse(handlerInput, {
      footer: 'Try again in a moment.',
      reprompt: 'Try again in a moment.',
      speech:
        `The line went quiet for a second. ${capabilityList()}`,
      subtitle: capabilityList(),
    });
  },
};

const skill = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    GetTodaysMoveIntentHandler,
    GetMindsetShiftIntentHandler,
    GetBusinessIdeaIntentHandler,
    GetTenXQuestionIntentHandler,
    GetOpportunitySpotterIntentHandler,
    GetAnotherInsightIntentHandler,
    HelpIntentHandler,
    YesIntentHandler,
    NoIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .create();

exports.handler = async (event, context) => skill.invoke(event, context);
