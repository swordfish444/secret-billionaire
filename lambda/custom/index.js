const Alexa = require('ask-sdk-core');

const { decorateResponseBuilder } = require('./lib/apl');
const { generateInsight } = require('./lib/ai');
const {
  CATEGORIES,
  fallbackInsightFor,
  nextCategoryFor,
  suggestionLabelFor,
} = require('./lib/content');

const MAX_SESSION_HISTORY = 4;

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
  return handlerInput.attributesManager.getSessionAttributes();
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

function followUpQuestion(category) {
  return `Would you like ${suggestionLabelFor(category)} next?`;
}

async function insightResponse(handlerInput, category, options = {}) {
  const attributes = sessionAttributes(handlerInput);
  const recentCategories = sessionHistory(attributes, 'recentCategories');
  const recentInsights = sessionHistory(attributes, 'recentInsights');
  const insight = await generateInsight({
    category,
    fallback: ({ exclude } = {}) => fallbackInsightFor(category, { exclude }),
    recentInsights,
  });
  const suggestedCategory =
    options.suggestedCategory ||
    nextCategoryFor(category, {
      exclude: [...recentCategories.slice(-2), category],
    });
  const nextQuestion = followUpQuestion(suggestedCategory);

  pushSessionHistory(attributes, 'recentCategories', category);
  pushSessionHistory(attributes, 'recentInsights', insight);
  attributes.suggestedCategory = suggestedCategory;
  saveSessionAttributes(handlerInput, attributes);

  return buildVisualResponse(handlerInput, {
    footer: options.footer || nextQuestion,
    reprompt: options.reprompt || nextQuestion,
    speech: [options.intro, insight, nextQuestion].filter(Boolean).join(' '),
    subtitle: insight,
  });
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  async handle(handlerInput) {
    return insightResponse(handlerInput, 'TODAYS_MOVE', {
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
      return insightResponse(handlerInput, category);
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
    const category = attributes.suggestedCategory || 'TODAYS_MOVE';
    return insightResponse(handlerInput, category);
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
    attributes.suggestedCategory = 'TODAYS_MOVE';
    saveSessionAttributes(handlerInput, attributes);
    return buildVisualResponse(handlerInput, {
      footer: "Would you like today's move next?",
      reprompt: "Would you like today's move next?",
      speech:
        "Secret Billionaire delivers one short empire-building insight at a time for ambitious people building real leverage from ordinary starting points. Ask for today's move, a mindset shift, a business idea, a ten X question, or an opportunity spotter. Would you like today's move next?",
      subtitle:
        "Ask for today's move, a mindset shift, a business idea, a ten X question, or an opportunity spotter.",
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
    const category = attributes.suggestedCategory || 'TODAYS_MOVE';
    return insightResponse(handlerInput, category);
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
    const suggestedCategory = attributes.suggestedCategory || 'TODAYS_MOVE';
    const nextQuestion = followUpQuestion(suggestedCategory);
    return buildVisualResponse(handlerInput, {
      footer: nextQuestion,
      reprompt: nextQuestion,
      speech:
        `I can help with today's move, a mindset shift, a business idea, a ten X question, or an opportunity spotter. ${nextQuestion}`,
      subtitle:
        "Ask for today's move, a mindset shift, a business idea, a ten X question, or an opportunity spotter.",
    });
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
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
        "The line went quiet for a second. Ask again for today's move, a mindset shift, a business idea, a ten X question, or an opportunity spotter.",
      subtitle:
        "Ask again for today's move, a mindset shift, a business idea, a ten X question, or an opportunity spotter.",
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
