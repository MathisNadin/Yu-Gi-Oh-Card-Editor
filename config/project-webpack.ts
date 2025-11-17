import { Configuration } from 'webpack';
import { TWebpackNodeEnv } from '../webpack/library';
import { cspCommon } from '../webpack/library/common/csp-common';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');

const externalMediaHosts = [
  'https://yuginews.fr',
  'https://www.yuginews.fr',
  'https://codexygo.test',
  'https://int.codexygo.fr',
  'https://codexygo.fr',
  'https://www.codexygo.fr',
  'https://www.db.yugioh-card.com',
  'https://db.ygoresources.com',
  'https://artworks-en-n.ygoresources.com',
  'https://yugipedia.com',
  'https://ms.yugipedia.com',
  'https://www.scanflip.fr',
  'https://media.scanflip.fr',
  'https://www.cards-capital.com',
];

const devProjectWebpackConfig: Configuration = {
  plugins: [
    new CspHtmlWebpackPlugin(
      {
        ...cspCommon,

        'script-src': [...cspCommon['script-src']!, "'unsafe-inline'", "'unsafe-eval'", 'http://localhost:*'],

        'style-src': [
          ...cspCommon['style-src']!,
          // keep inline styles in dev (and avoid nonces for styles so browsers don't ignore 'unsafe-inline')
          "'unsafe-inline'",
        ],

        'style-src-elem': [...cspCommon['style-src-elem']!, "'unsafe-inline'"],

        'connect-src': [...cspCommon['connect-src']!, 'ws://localhost:*', 'wss://localhost:*', ...externalMediaHosts],

        'img-src': [...cspCommon['img-src']!, ...externalMediaHosts],

        'media-src': ["'self'", ...externalMediaHosts],
      },
      {
        enabled: true,
        hashingMethod: 'sha256',
        hashEnabled: {
          'style-src': false,
          'style-src-elem': false,
        },
        nonceEnabled: {
          'style-src': false,
          'style-src-elem': false,
        },
      }
    ),
  ],
};

const prodProjectWebpackConfig: Configuration = {
  plugins: [
    new CspHtmlWebpackPlugin(
      {
        ...cspCommon,

        'script-src': [
          ...cspCommon['script-src']!,
          // keep only if you still have inline scripts without nonce/hash
          "'unsafe-inline'",
          // do NOT include 'unsafe-eval' in prod
        ],

        'style-src': [
          ...cspCommon['style-src']!,
          // keep if AdSense / your app inject inline styles; remove if you serve CSS files only
          "'unsafe-inline'",
        ],

        'style-src-elem': [
          ...cspCommon['style-src-elem']!,
          // keep if AdSense / your app inject inline styles; remove if you serve CSS files only
          "'unsafe-inline'",
        ],

        'connect-src': [...cspCommon['connect-src']!, ...externalMediaHosts],

        'img-src': [...cspCommon['img-src']!, ...externalMediaHosts],

        'media-src': ["'self'", ...externalMediaHosts],
      },
      {
        enabled: true,
        hashingMethod: 'sha256',
        hashEnabled: {
          'style-src': false,
          'style-src-elem': false,
        },
        nonceEnabled: {
          'style-src': false,
          'style-src-elem': false,
        },
      }
    ),
  ],
};

const nodeEnv = process.env.NODE_ENV as TWebpackNodeEnv;
const projectWebpackConfig: Configuration =
  nodeEnv === 'production' ? prodProjectWebpackConfig : devProjectWebpackConfig;

export { projectWebpackConfig };
