# Secret Billionaire Submission Checklist

Use this checklist before submitting the skill in the Alexa Developer Console.

## Build

- Build the interaction model with zero errors.
- Confirm the invocation name is `secret billionaire`.
- Confirm the default endpoint points to the personal AWS Lambda function.
- Confirm APL is enabled and the multimodal response renders on the Device Display simulator.

## Functional checks

- Launch request returns one short branded insight.
- Each category intent returns a short branded insight:
  - Today's Move
  - Mindset Shift
  - Business Idea
  - 10X Question
  - Opportunity Spotter
- Help intent explains the available categories clearly.
- Stop and Cancel exit cleanly.
- Fallback explains the valid categories without sounding generic.

## Content quality

- Responses stay concise and voice-friendly.
- Responses avoid illegal, deceptive, exploitative, or personalized financial-advice content.
- Responses do not ramble, list references, or break brand tone.

## Privacy and compliance

- Privacy policy URL matches `docs/privacy-policy.md`.
- Terms of use URL matches `docs/terms-of-use.md`.
- Console answers indicate that the skill does not request customer contact permissions.
- Testing instructions mention that the skill uses OpenRouter to generate general business prompts without personal data.

## Store details

- Skill name: `Secret Billionaire`
- Tagline: `Build your empire. One move at a time.`
- Example phrases match the interaction model.
- Icons and store images are uploaded from `assets/`.
