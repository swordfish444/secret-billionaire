# Privacy Policy for Secret Billionaire

Effective date: March 8, 2026

Secret Billionaire is an Alexa custom skill that delivers short empire-building insights in response to a customer's request. This policy explains what information the skill uses, how it is processed, and the third parties involved in operating the skill.

## What the skill uses

Secret Billionaire is designed to minimize data use. The skill uses only the information needed to generate and return the spoken response that the customer requests.

This can include:

- the intent or category requested by the customer, such as Today's Move, Mindset Shift, Business Idea, 10X Question, or Opportunity Spotter
- the general wording of the customer's request that Alexa sends to the skill as part of the standard skill request
- operational metadata needed to process the request and return a response

The skill is not designed to request or store a customer's name, email address, phone number, postal address, payment information, or account-linking credentials.

## External text-generation processing

Secret Billionaire uses the OpenRouter API to generate short strategic responses. The skill is configured to use the Kimi 2.5 model through OpenRouter.

When this happens, the skill may send:

- the requested content category
- style instructions that define the Secret Billionaire tone and response length
- any non-personal prompt context needed to generate the requested response

The skill is not designed to send the customer's contact information, financial account information, or other directly identifying personal information to OpenRouter.

If the external text-generation service is unavailable, the skill falls back to an internal content library.

## What the skill does not request

Secret Billionaire does not use account linking and does not request:

- name
- email address
- phone number
- physical address
- payment information

## How the information is used

The information described above is used only to:

- understand which Secret Billionaire content category the customer requested
- generate a short spoken response in the skill's brand voice
- return the requested response to Alexa
- support debugging, reliability, and security for skill operations

## Where the information is processed

Secret Billionaire runs as an AWS-hosted Alexa skill and uses:

- Amazon Alexa services
- AWS Lambda for skill execution
- OpenRouter and the selected underlying model provider for response generation

These providers may process limited request data as required to deliver the service.

## Data retention

Secret Billionaire does not maintain a separate customer profile or marketing database.

- The skill does not persist customer-specific coaching history.
- Skill execution logs may temporarily include operational request and error data needed for debugging and reliability.
- The skill is designed to avoid storing unnecessary customer data.

## Sharing and advertising

Secret Billionaire does not sell customer information and does not use customer information for advertising.

Information is shared only with service providers needed to operate the skill, such as Amazon Alexa services, AWS, and OpenRouter or the selected model provider.

## Children

Secret Billionaire is not directed to children.

## Security

Secret Billionaire is designed to limit the information it processes to the minimum required to generate and deliver a response. No security method can guarantee absolute protection, but the skill is designed to avoid collecting unnecessary personal data.

## Changes to this policy

This policy may be updated as the skill changes. The most current version will be published at this URL.

## Contact

Questions about this policy can be submitted through the project repository at [https://github.com/swordfish444/secret-billionaire/issues](https://github.com/swordfish444/secret-billionaire/issues).
