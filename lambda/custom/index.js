const Alexa = require('ask-sdk-core');

const { decorateResponseBuilder } = require('./lib/apl');
const { generateInsight } = require('./lib/ai');
const { CATEGORIES, fallbackInsightFor } = require('./lib/content');

function buildVisualResponse(
  handlerInput,
  {
    footer,
    reprompt,
    speech,
    subtitle = speech,
    title = 'Secret Billionaire',
  },
) {
  const responseBuilder = handlerInput.responseBuilder.speak(speech);

  if (reprompt) {
    responseBuilder.reprompt(reprompt);
  }

  decorateResponseBuilder(handlerInput, responseBuilder, {
    footer,
    subtitle,
    title,
  });

  return responseBuilder.getResponse();
}

async function insightResponse(handlerInput, category, options = {}) {
  const insight = await generateInsight({
    category,
    fallback: () => fallbackInsightFor(category),
  });

  return buildVisualResponse(handlerInput, {
    footer:
      options.footer || 'Ask for a mindset shift, a business idea, a ten X question, or an opportunity spotter.',
    reprompt:
      options.reprompt ||
      'You can say mindset shift, business idea, ten X question, or opportunity spotter.',
    speech: options.intro ? `${options.intro} ${insight}` : insight,
    subtitle: insight,
  });
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  async handle(handlerInput) {
    return insightResponse(handlerInput, 'TODAYS_MOVE', {
      footer: 'Want a mindset shift, a business idea, a ten X question, or an opportunity spotter?',
      intro: 'Welcome to Secret Billionaire.',
      reprompt: 'You can say, give me a mindset shift, a business idea, a ten X question, or an opportunity spotter.',
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

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
    );
  },
  handle(handlerInput) {
    return buildVisualResponse(handlerInput, {
      footer: "Try saying: give me today's move.",
      reprompt: "Try saying, give me today's move.",
      speech:
        "Secret Billionaire delivers one short empire-building insight at a time. Ask for today's move, a mindset shift, a business idea, a ten X question, or an opportunity spotter.",
      subtitle:
        "Ask for today's move, a mindset shift, a business idea, a ten X question, or an opportunity spotter.",
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
    return handlerInput.responseBuilder.speak('Understood. Build your empire. One move at a time.').getResponse();
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
    return buildVisualResponse(handlerInput, {
      footer: 'Try saying: business idea.',
      reprompt: 'Try saying, business idea.',
      speech:
        "Secret Billionaire stays focused. Ask for today's move, a mindset shift, a business idea, a ten X question, or an opportunity spotter.",
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
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .create();

exports.handler = async (event, context) => skill.invoke(event, context);
