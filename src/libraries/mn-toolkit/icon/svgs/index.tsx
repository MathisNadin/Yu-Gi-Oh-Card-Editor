declare global {
  interface ISvgIcons {
    'toolkit-sword': ISvgIcons;
    'toolkit-shield': ISvgIcons;
    'toolkit-pen': ISvgIcons;
    'toolkit-script': ISvgIcons;
    'toolkit-close': ISvgIcons;
    'toolkit-plus': ISvgIcons;
    'toolkit-angle-down': ISvgIcons;
    'toolkit-angle-left': ISvgIcons;
    'toolkit-angle-right': ISvgIcons;
    'toolkit-angle-up': ISvgIcons;
    'toolkit-cog': ISvgIcons;
    "toolkit-menu-candy-box": ISvgIcons;
    "toolkit-menu-handburger": ISvgIcons;
    "toolkit-menu-kebab": ISvgIcons;
    "toolkit-menu-meatballs": ISvgIcons;
    "toolkit-star-outline": ISvgIcons;
    "toolkit-star": ISvgIcons;
  }
}

export function loadSvgs() {
  app.$icon.register('toolkit-sword', <svg viewBox="-0.75 -0.75 48 48" xmlns="http://www.w3.org/2000/svg" height="48" width="48"><path d="M19.326562499999998 35.4659375 11.043750000000001 27.173437500000002 35.547312500000004 2.6601875a1.46475 1.46475 0 0 1 0.87575 -0.4204375l6.9963125 -0.775a1.4666875 1.4666875 0 0 1 1.6178124999999999 1.6178124999999999l-0.775 6.9963125a1.46475 1.46475 0 0 1 -0.4204375 0.87575Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5"></path><path d="m12.070625000000001 28.21 -9.329062500000001 9.329062500000001a4.398125 4.398125 0 0 0 6.219375 6.219375L18.29 34.429375Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5"></path><path d="m7.9243749999999995 24.06375 14.511875 14.511875" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5"></path><path d="m35.9115625 10.5884375 -20.73125 20.73125" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5"></path></svg>);

  app.$icon.register('toolkit-shield', <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-0.75 -0.75 48 48" height="48" width="48"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M24.4283875 44.1815875c-0.7538812500000001 0.29585625 -1.5937875 0.29585625 -2.3571625 0C9.980062499999999 39.51511875 2.001999375 27.891475 1.9829149999999998 14.922411875V5.369723125c0 -1.803638125 1.4696325 -3.2732900000000003 3.2732900000000003 -3.2732900000000003H41.24336875c1.8036187499999998 0 3.2732125 1.469651875 3.2732125 3.2732900000000003v9.55268875c-0.00949375 12.959569375000001 -7.997031250000001 24.583019375 -20.08819375 29.249681875v0.00949375Z" strokeWidth="3.5"></path><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M23.95466875 34.441c-0.4506625 0.17069375 -0.9526687500000001 0.17069375 -1.40895 0 -7.2280375 -2.6919625 -11.997251875 -9.39668125 -12.00866375 -16.87775625V12.052935625c0 -1.040418125 0.87854 -1.888151875 1.956739375 -1.888151875H34.0066125c1.07821875 0 1.956875 0.84773375 1.956875 1.888151875V17.563243749999998c-0.0058125 7.47545625 -4.7807812499999995 14.18036875 -12.00881875 16.8721375v0.00561875Z" strokeWidth="3.5"></path></svg>);

  app.$icon.register('toolkit-script', <svg  viewBox="0 0 24 24"><path fill="currentcolor" d="M15,20A1,1 0 0,0 16,19V4H8A1,1 0 0,0 7,5V16H5V5A3,3 0 0,1 8,2H19A3,3 0 0,1 22,5V6H20V5A1,1 0 0,0 19,4A1,1 0 0,0 18,5V9L18,19A3,3 0 0,1 15,22H5A3,3 0 0,1 2,19V18H13A2,2 0 0,0 15,20M9,6H14V8H9V6M9,10H14V12H9V10M9,14H14V16H9V14Z" /></svg>);

  app.$icon.register('toolkit-pen', <svg  viewBox="0 0 14 14" height="48" width="48"><g><line x1="0.5" y1="13.5" x2="2.5" y2="11.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></line><path d="M4.71,12.29a1,1,0,0,1-1.42,0L1.71,10.71a1,1,0,0,1,0-1.42L9.88,1.12a2.12,2.12,0,0,1,3,3Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></path><path d="M11.5,5.5,7.21,1.21a1,1,0,0,0-1.42,0L2.5,4.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></path></g></svg>);

  app.$icon.register('toolkit-star-outline', <svg viewBox="0 0 24 24"> <path d="M12,15.39L8.24,17.66L9.23,13.38L5.91,10.5L10.29,10.13L12,6.09L13.71,10.13L18.09,10.5L14.77,13.38L15.76,17.66M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z" /> </svg>);

  app.$icon.register('toolkit-star', <svg viewBox="0 0 24 24"> <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" /> </svg>);

  app.$icon.register('toolkit-close', <svg viewBox="0 0 24 24"><path fill="currentColor" d="M13.46,12L19,17.54V19H17.54L12,13.46L6.46,19H5V17.54L10.54,12L5,6.46V5H6.46L12,10.54L17.54,5H19V6.46L13.46,12Z" /></svg>);

  app.$icon.register('toolkit-plus', <svg viewBox="0 0 24 24"><path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg>);

  app.$icon.register('toolkit-angle-down', <svg viewBox="0 0 24 24"> <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" fill="currentColor"/> </svg>);

  app.$icon.register('toolkit-angle-left', <svg viewBox="-1 -1 24 24" version="1.1" id="svg837"><defs id="defs841" /> <path d="M 13.25561,17.936813 6.6455982,11.326801 a 0.46183755,0.46183755 0 0 1 0,-0.653602 L 13.25561,4.0631875" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16725" id="path835" /></svg>);

  app.$icon.register('toolkit-angle-right', <svg viewBox="-1 -1 24 24" version="1.1" id="svg4"><defs id="defs8" /><path d="m 6.7293532,4.1607839 6.5170128,6.5170131 a 0.45533981,0.45533981 0 0 1 0,0.644406 l -6.5170128,6.517013" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.32639" id="path2" /> </svg>);

  app.$icon.register('toolkit-angle-up', <svg viewBox="0 0 24 24"><path d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" fill="currentColor" /></svg>);

  app.$icon.register('toolkit-cog', <svg  viewBox="0 0 14 14" height="48" width="48" strokeWidth="1"><path d="M5.23,2.25l.43-1.11A1,1,0,0,1,6.59.5h.82a1,1,0,0,1,.93.64l.43,1.11,1.46.84,1.18-.18a1,1,0,0,1,1,.49l.4.7a1,1,0,0,1-.08,1.13L12,6.16V7.84l.75.93a1,1,0,0,1,.08,1.13l-.4.7a1,1,0,0,1-1,.49l-1.18-.18-1.46.84-.43,1.11a1,1,0,0,1-.93.64H6.59a1,1,0,0,1-.93-.64l-.43-1.11-1.46-.84-1.18.18a1,1,0,0,1-1-.49l-.4-.7a1,1,0,0,1,.08-1.13L2,7.84V6.16l-.75-.93A1,1,0,0,1,1.17,4.1l.4-.7a1,1,0,0,1,1-.49l1.18.18ZM5,7A2,2,0,1,0,7,5,2,2,0,0,0,5,7Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></path></svg>);

  app.$icon.register('toolkit-menu-candy-box', <svg  viewBox="0 0 24 24"><path d="M12 16C13.1 16 14 16.9 14 18S13.1 20 12 20 10 19.1 10 18 10.9 16 12 16M12 10C13.1 10 14 10.9 14 12S13.1 14 12 14 10 13.1 10 12 10.9 10 12 10M12 4C13.1 4 14 4.9 14 6S13.1 8 12 8 10 7.1 10 6 10.9 4 12 4M6 16C7.1 16 8 16.9 8 18S7.1 20 6 20 4 19.1 4 18 4.9 16 6 16M6 10C7.1 10 8 10.9 8 12S7.1 14 6 14 4 13.1 4 12 4.9 10 6 10M6 4C7.1 4 8 4.9 8 6S7.1 8 6 8 4 7.1 4 6 4.9 4 6 4M18 16C19.1 16 20 16.9 20 18S19.1 20 18 20 16 19.1 16 18 16.9 16 18 16M18 10C19.1 10 20 10.9 20 12S19.1 14 18 14 16 13.1 16 12 16.9 10 18 10M18 4C19.1 4 20 4.9 20 6S19.1 8 18 8 16 7.1 16 6 16.9 4 18 4Z" /></svg>);

  app.$icon.register('toolkit-menu-handburger', <svg viewBox="0 0 24 24"> <path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" /> </svg>);

  app.$icon.register('toolkit-menu-kebab', <svg  viewBox="0 0 24 24"><path fill="currentColor" d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z" /></svg>);

  app.$icon.register('toolkit-menu-meatballs', <svg  viewBox="0 0 24 24"><path fill="currentcolor" d="M16,12A2,2 0 0,1 18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12M10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12M4,12A2,2 0 0,1 6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12Z" /></svg>);
}
