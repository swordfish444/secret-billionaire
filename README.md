# Secret Billionaire

Secret Billionaire is an Alexa custom skill that delivers a short, premium, noir-style empire-building insight each time a customer opens the skill or asks for a specific category.

Tagline: Build your empire. One move at a time.

## Product shape

- Stateless and lightweight.
- No accounts, memory, persistence, reminders, dashboards, or gamification.
- One short insight at a time, tuned for voice.
- Each response recommends one next category so the customer can simply say yes or no to continue.
- Echo Show devices render a branded multimodal response with Alexa Presentation Language and a muted background video.

## Content categories

- Today's Move
- Mindset Shift
- Business Idea
- 10X Question
- Opportunity Spotter

## Message generation

- The skill uses OpenRouter with the Kimi 2.5 model to generate short branded coaching moments on demand.
- The prompt is constrained to practical, ethical, voice-friendly wealth-building insights for real people building toward ownership from ordinary starting points.
- The generator avoids repeating recent ideas during a session and also rejects overly similar fresh outputs before speaking them.
- If OpenRouter is unavailable or `OPENROUTER_TOKEN` is not configured, the skill falls back to an internal content library.

## Repo layout

- `lambda/custom`: Node.js Lambda code for the Alexa skill.
- `skill-package`: Alexa manifest and interaction model assets.
- `docs`: privacy policy, terms, and submission notes.
- `assets`: public icon and store/display assets.

## Environment

The Lambda runtime target is AWS Lambda `nodejs22.x`.

The Lambda environment can be configured with:

- `OPENROUTER_TOKEN`: OpenRouter API token
- `OPENROUTER_MODEL`: optional override for the model identifier, defaults to `moonshotai/kimi-k2.5`
- `AI_MAX_WORDS`: optional word cap for generated responses
- `AI_MAX_SENTENCES`: optional sentence cap for generated responses

## Local development

```bash
cd lambda/custom
npm install
npm test
```

## Example utterances

- `Alexa, open secret billionaire`
- `Alexa, ask secret billionaire for today's move`
- `Alexa, ask secret billionaire for a mindset shift`
- `Alexa, ask secret billionaire for a business idea`
- `Alexa, ask secret billionaire for a ten x question`
- `Alexa, ask secret billionaire to help me spot an opportunity`
- `Alexa, ask secret billionaire for another business idea`
- `Alexa, ask secret billionaire for another move`
- `Yes`
- `No`

## Current constraints

- The skill is intentionally narrow and does not maintain state between sessions.
- The spoken content is general strategic coaching and idea generation, not personalized investment, legal, or tax advice.
- Before store submission, make sure the Alexa console privacy answers still match `docs/privacy-policy.md` and the current external API usage.
