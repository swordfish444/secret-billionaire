const ICON_URL =
  'https://raw.githubusercontent.com/swordfish444/secret-billionaire/main/assets/icon-512.png';
const BACKGROUND_URL =
  'https://raw.githubusercontent.com/swordfish444/secret-billionaire/main/assets/show-background.png';
const VIDEO_URL =
  'https://raw.githubusercontent.com/swordfish444/secret-billionaire/main/assets/show-video-muted.mp4';

function supportsApl(handlerInput) {
  return Boolean(
    handlerInput.requestEnvelope.context?.System?.device?.supportedInterfaces?.['Alexa.Presentation.APL'],
  );
}

function standardCardText({ subtitle, footer }) {
  return [subtitle, footer].filter(Boolean).join('\n\n');
}

function buildDocument({ footer, subtitle, title }) {
  return {
    type: 'APL',
    version: '1.9',
    import: [
      {
        name: 'alexa-layouts',
        version: '1.7.0',
      },
    ],
    mainTemplate: {
      items: [
        {
          type: 'Container',
          width: '100vw',
          height: '100vh',
          items: [
            {
              type: 'AlexaBackground',
              backgroundImageSource: BACKGROUND_URL,
              backgroundVideoSource: [
                {
                  url: VIDEO_URL,
                  repeatCount: 3,
                },
              ],
              videoAudioTrack: 'none',
              videoAutoPlay: true,
              width: '100vw',
              height: '100vh',
            },
            {
              type: 'Frame',
              width: '100vw',
              height: '100vh',
              backgroundColor: '#050505B8',
            },
            {
              type: 'Container',
              direction: 'column',
              justifyContent: 'spaceBetween',
              paddingTop: '36dp',
              paddingBottom: '30dp',
              paddingLeft: '36dp',
              paddingRight: '36dp',
              width: '100vw',
              height: '100vh',
              items: [
                {
                  type: 'Container',
                  direction: 'row',
                  alignItems: 'center',
                  spacing: '16dp',
                  items: [
                    {
                      type: 'Image',
                      source: ICON_URL,
                      width: '72dp',
                      height: '72dp',
                      borderRadius: '20dp',
                    },
                    {
                      type: 'Text',
                      text: title,
                      fontSize: '40dp',
                      fontWeight: '700',
                      color: '#F9D773',
                      maxLines: 2,
                    },
                  ],
                },
                {
                  type: 'Frame',
                  backgroundColor: '#0B0B0BDC',
                  borderColor: '#E6B84E',
                  borderWidth: '2dp',
                  borderRadius: '20dp',
                  paddingTop: '28dp',
                  paddingBottom: '24dp',
                  paddingLeft: '28dp',
                  paddingRight: '28dp',
                  items: [
                    {
                      type: 'Container',
                      direction: 'column',
                      spacing: '18dp',
                      items: [
                        {
                          type: 'Text',
                          text: subtitle,
                          fontSize: '30dp',
                          lineHeight: '38dp',
                          color: '#FFF2CC',
                          maxLines: 7,
                        },
                        ...(footer
                          ? [
                              {
                                type: 'Text',
                                text: footer,
                                fontSize: '20dp',
                                color: '#E6D8AF',
                                maxLines: 2,
                              },
                            ]
                          : []),
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  };
}

function decorateResponseBuilder(
  handlerInput,
  responseBuilder,
  {
    footer = 'Ask for a mindset shift, a business idea, or a ten X question.',
    subtitle,
    title = 'Secret Billionaire',
  } = {},
) {
  const cardText = standardCardText({
    subtitle,
    footer,
  });

  responseBuilder.withStandardCard(title, cardText || subtitle || title, ICON_URL, BACKGROUND_URL);

  if (!supportsApl(handlerInput)) {
    return responseBuilder;
  }

  responseBuilder.addDirective({
    type: 'Alexa.Presentation.APL.RenderDocument',
    token: `secret-billionaire-${Date.now()}`,
    document: buildDocument({
      footer,
      subtitle: subtitle || title,
      title,
    }),
  });

  return responseBuilder;
}

module.exports = {
  BACKGROUND_URL,
  ICON_URL,
  VIDEO_URL,
  decorateResponseBuilder,
  supportsApl,
};
