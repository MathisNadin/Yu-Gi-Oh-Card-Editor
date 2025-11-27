import type { Policy } from 'csp-html-webpack-plugin';

// CSP rules for AdSense + general web hygiene
export const cspCommon: Policy = {
  // Basic hygiene
  'base-uri': ["'self'"],
  'object-src': ["'none'"],

  // AdSense / Ads scripts
  'script-src': [
    "'self'",
    'https://pagead2.googlesyndication.com',
    'https://tpc.googlesyndication.com',
    'https://googleads.g.doubleclick.net',
    'https://adservice.google.com',
    'https://adservice.google.fr',
    'https://*.adtrafficquality.google',
  ],

  // Some browsers apply this specifically to <script src> tags
  'script-src-elem': [
    "'self'",
    'https://pagead2.googlesyndication.com',
    'https://tpc.googlesyndication.com',
    'https://googleads.g.doubleclick.net',
    'https://adservice.google.com',
    'https://adservice.google.fr',
    'https://*.adtrafficquality.google',
  ],

  // Styles & fonts
  // (Inline styles allowance is decided per-env below)
  'style-src': ["'self'", 'https://fonts.googleapis.com'],
  'style-src-elem': ["'self'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],

  // Images (ad pixels, creatives)
  'img-src': [
    "'self'",
    'data:',
    'https://pagead2.googlesyndication.com',
    'https://tpc.googlesyndication.com',
    'https://googleads.g.doubleclick.net',
    'https://adservice.google.com',
    'https://adservice.google.fr',
    'https://*.adtrafficquality.google',
  ],

  // Frames used by AdSense
  'frame-src': [
    "'self'",
    'https://googleads.g.doubleclick.net',
    'https://tpc.googlesyndication.com',
    'https://pagead2.googlesyndication.com',
    'https://*.adtrafficquality.google',
  ],

  // XHR/fetch endpoints used by ad scripts
  'connect-src': [
    "'self'",
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://pagead2.googlesyndication.com',
    'https://tpc.googlesyndication.com',
    'https://googleads.g.doubleclick.net',
    'https://adservice.google.com',
    'https://adservice.google.fr',
    'https://*.adtrafficquality.google',
  ],
};
