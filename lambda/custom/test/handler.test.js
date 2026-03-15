const test = require('node:test');
const assert = require('node:assert/strict');

process.env.OPENROUTER_TOKEN = '';

const { handler } = require('../index');

function requestEnvelope(request, sessionAttributes = {}, isNew = false) {
  return {
    version: '1.0',
    session: {
      new: isNew,
      sessionId: 'SessionId.test',
      application: {
        applicationId: 'amzn1.ask.skill.test',
      },
      attributes: sessionAttributes,
      user: {
        userId: 'amzn1.ask.account.test',
      },
    },
    context: {
      System: {
        application: {
          applicationId: 'amzn1.ask.skill.test',
        },
        user: {
          userId: 'amzn1.ask.account.test',
        },
        device: {
          deviceId: 'device-id',
          supportedInterfaces: {},
        },
        apiEndpoint: 'https://api.amazonalexa.com',
        apiAccessToken: 'test-token',
      },
    },
    request: {
      locale: 'en-US',
      requestId: `req-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      ...request,
    },
  };
}

function launchRequest() {
  return requestEnvelope(
    {
      type: 'LaunchRequest',
    },
    {},
    true,
  );
}

function intentRequest(intentName, sessionAttributes = {}) {
  return requestEnvelope({
    type: 'IntentRequest',
    intent: {
      name: intentName,
      confirmationStatus: 'NONE',
      slots: {},
    },
  }, sessionAttributes);
}

function outputSpeechText(response) {
  return response?.response?.outputSpeech?.ssml || '';
}

test('launch sets a follow-up question and session state', async () => {
  const response = await handler(launchRequest(), {});

  assert.equal(response.response.shouldEndSession, false);
  assert.match(outputSpeechText(response), /Would you like .* next\? Just say yes or no\./i);
  assert.equal(response.sessionAttributes.pendingFollowUp, true);
  assert.equal(typeof response.sessionAttributes.suggestedCategory, 'string');
});

test('yes intent follows the suggested category from the prior turn', async () => {
  const launch = await handler(launchRequest(), {});
  const suggestedCategory = launch.sessionAttributes.suggestedCategory;
  const response = await handler(intentRequest('AMAZON.YesIntent', launch.sessionAttributes), {});

  assert.equal(response.sessionAttributes.currentCategory, suggestedCategory);
  assert.equal(response.sessionAttributes.pendingFollowUp, true);
  assert.match(outputSpeechText(response), /Would you like .* next\? Just say yes or no\./i);
});

test('explicit category requests override any pending follow-up', async () => {
  const launch = await handler(launchRequest(), {});
  const response = await handler(
    intentRequest('GetTenXQuestionIntent', launch.sessionAttributes),
    {},
  );

  assert.equal(response.sessionAttributes.currentCategory, 'TEN_X_QUESTION');
  assert.match(outputSpeechText(response), /10X question:/i);
});

test('no intent exits cleanly instead of continuing the loop', async () => {
  const launch = await handler(launchRequest(), {});
  const response = await handler(intentRequest('AMAZON.NoIntent', launch.sessionAttributes), {});

  assert.equal(response.response.shouldEndSession, true);
  assert.match(outputSpeechText(response), /Build your empire\. One move at a time\./i);
});

test('fifth guided insight ends the session automatically', async () => {
  let response = await handler(launchRequest(), {});
  let attributes = response.sessionAttributes;

  for (let step = 0; step < 3; step += 1) {
    response = await handler(intentRequest('AMAZON.YesIntent', attributes), {});
    attributes = response.sessionAttributes;
    assert.equal(response.response.shouldEndSession, false);
  }

  response = await handler(intentRequest('AMAZON.YesIntent', attributes), {});

  assert.equal(response.response.shouldEndSession, true);
  assert.match(
    outputSpeechText(response),
    /That is enough for one session\. Build your empire\. One move at a time\./i,
  );
  assert.equal(response.sessionAttributes.pendingFollowUp, undefined);
  assert.equal(response.sessionAttributes.suggestedCategory, undefined);
});
