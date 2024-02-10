declare global {
  interface ISvgIcons {
    'toolkit-origami-sword': ISvgIcons;
    'toolkit-sword': ISvgIcons;
    'toolkit-shield': ISvgIcons;
    'toolkit-pen': ISvgIcons;
    'toolkit-empty-small-script': ISvgIcons;
    'toolkit-small-script': ISvgIcons;
    'toolkit-script': ISvgIcons;
    'toolkit-close': ISvgIcons;
    'toolkit-minus': ISvgIcons;
    'toolkit-plus': ISvgIcons;
    'toolkit-upload': ISvgIcons;
    'toolkit-angle-down': ISvgIcons;
    'toolkit-angle-left': ISvgIcons;
    'toolkit-angle-right': ISvgIcons;
    'toolkit-angle-up': ISvgIcons;
    'toolkit-cog': ISvgIcons;
    'toolkit-menu-candy-box': ISvgIcons;
    'toolkit-menu-handburger': ISvgIcons;
    'toolkit-menu-kebab': ISvgIcons;
    'toolkit-menu-meatballs': ISvgIcons;
    'toolkit-star-outline': ISvgIcons;
    'toolkit-star': ISvgIcons;
    'toolkit-image': ISvgIcons;
    'toolkit-image-sync': ISvgIcons;
    'toolkit-folder-image': ISvgIcons;
    'toolkit-lock-opened': ISvgIcons;
    'toolkit-lock-closed': ISvgIcons;
    'toolkit-info-circle': ISvgIcons;
    'toolkit-error-circle': ISvgIcons;
    'toolkit-hash': ISvgIcons;
    'toolkit-card': ISvgIcons;
    'toolkit-sticker': ISvgIcons;
    'toolkit-id': ISvgIcons;
    'toolkit-color-palette': ISvgIcons;
    'toolkit-title': ISvgIcons;
    'toolkit-language': ISvgIcons;
    'toolkit-copyright': ISvgIcons;
    'toolkit-print': ISvgIcons;
    'toolkit-trash': ISvgIcons;
    'toolkit-check-mark': ISvgIcons;
    'toolkit-pin': ISvgIcons;
    'toolkit-diamond': ISvgIcons;
    'toolkit-diamond-shine': ISvgIcons;
    'toolkit-eye-open': ISvgIcons;
    'toolkit-eye-close': ISvgIcons;
    'toolkit-millennium-puzzle': ISvgIcons;
    'toolkit-copy': ISvgIcons;
  }
}

export function loadSvgs() {
  app.$icon.register(
    'toolkit-upload',
    <svg viewBox='0 0 24 24'>
      {' '}
      <path
        fill='currentColor'
        d='M13,2.03C17.73,2.5 21.5,6.25 21.95,11C22.5,16.5 18.5,21.38 13,21.93V19.93C16.64,19.5 19.5,16.61 19.96,12.97C20.5,8.58 17.39,4.59 13,4.05V2.05L13,2.03M11,2.06V4.06C9.57,4.26 8.22,4.84 7.1,5.74L5.67,4.26C7.19,3 9.05,2.25 11,2.06M4.26,5.67L5.69,7.1C4.8,8.23 4.24,9.58 4.05,11H2.05C2.25,9.04 3,7.19 4.26,5.67M2.06,13H4.06C4.24,14.42 4.81,15.77 5.69,16.9L4.27,18.33C3.03,16.81 2.26,14.96 2.06,13M7.1,18.37C8.23,19.25 9.58,19.82 11,20V22C9.04,21.79 7.18,21 5.67,19.74L7.1,18.37M12,7.5L7.5,12H11V16H13V12H16.5L12,7.5Z'
      />{' '}
    </svg>
  );

  app.$icon.register(
    'toolkit-copy',
    <svg width='800px' height='800px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M21 8C21 6.34315 19.6569 5 18 5H10C8.34315 5 7 6.34315 7 8V20C7 21.6569 8.34315 23 10 23H18C19.6569 23 21 21.6569 21 20V8ZM19 8C19 7.44772 18.5523 7 18 7H10C9.44772 7 9 7.44772 9 8V20C9 20.5523 9.44772 21 10 21H18C18.5523 21 19 20.5523 19 20V8Z'
        fill='#0F0F0F'
      />
      <path
        d='M6 3H16C16.5523 3 17 2.55228 17 2C17 1.44772 16.5523 1 16 1H6C4.34315 1 3 2.34315 3 4V18C3 18.5523 3.44772 19 4 19C4.55228 19 5 18.5523 5 18V4C5 3.44772 5.44772 3 6 3Z'
        fill='#0F0F0F'
      />
    </svg>
  );

  app.$icon.register(
    'toolkit-millennium-puzzle',
    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='-2 -2 128 128' height='128' width='128'>
      <path
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M61.99999999999999 118.83333333333331 118.83333333333331 25.374171666666665H5.166666666666666L61.99999999999999 118.83333333333331Z'
        strokeWidth='8'
      ></path>
      <path
        stroke='currentColor'
        d='M61.99999999999999 58.21128333333333c-1.395 0 -2.525983333333333 -1.1309833333333332 -2.525983333333333 -2.525983333333333s1.1309833333333332 -2.525983333333333 2.525983333333333 -2.525983333333333'
        strokeWidth='8'
      ></path>
      <path
        stroke='currentColor'
        d='M61.99999999999999 58.21128333333333c1.395 0 2.525983333333333 -1.1309833333333332 2.525983333333333 -2.525983333333333s-1.1309833333333332 -2.525983333333333 -2.525983333333333 -2.525983333333333'
        strokeWidth='8'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M44.318529999999996 46.844358333333325h4.551729999999999'
        strokeWidth='8'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M79.68136666666666 46.844358333333325h-4.551833333333333'
        strokeWidth='8'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M44.318529999999996 64.52598333333333h4.551729999999999'
        strokeWidth='8'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M79.68136666666666 64.52598333333333h-4.551833333333333'
        strokeWidth='8'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M48.94600333333333 64.52598333333333c1.3149166666666665 2.3012333333333332 3.215113333333333 4.214449999999999 5.507563333333333 5.544866666666666 2.2924499999999997 1.3304166666666666 4.895933333333333 2.0310166666666665 7.546433333333332 2.0310166666666665 2.6504999999999996 0 5.253983333333332 -0.7005999999999999 7.546433333333332 -2.0310166666666665s4.192749999999999 -3.243633333333333 5.507666666666666 -5.544866666666666'
        strokeWidth='8'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M75.05409999999999 46.844255c-1.3149166666666665 -2.30144 -3.215216666666666 -4.214398333333333 -5.507666666666666 -5.544866666666666 -2.2924499999999997 -1.33052 -4.895933333333333 -2.031275 -7.546433333333332 -2.031275 -2.6504999999999996 0 -5.253983333333332 0.7007549999999999 -7.546433333333332 2.031275 -2.2924499999999997 1.3304683333333334 -4.192646666666666 3.2434266666666662 -5.507563333333333 5.544866666666666'
        strokeWidth='8'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M61.99999999999999 25.37406833333333c5.58 0 10.103933333333332 -4.523571666666666 10.103933333333332 -10.103674999999999C72.10393333333333 9.690238333333332 67.58 5.166666666666666 61.99999999999999 5.166666666666666s-10.103933333333332 4.523571666666666 -10.103933333333332 10.103726666666665c0 5.580103333333333 4.523933333333333 10.103674999999999 10.103933333333332 10.103674999999999Z'
        strokeWidth='8'
      ></path>
    </svg>
  );

  app.$icon.register(
    'toolkit-image-sync',
    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='-1 -1 24 24'>
      <path
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M13.75 17.1875h-3.4375v3.4375'
        strokeWidth='2'
      ></path>
      <path
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M20.778083333333335 17.859416666666668c-0.3641 1.0639750000000001 -1.0692000000000002 1.9781666666666664 -2.00585 2.6004916666666666 -0.93665 0.6224166666666667 -2.0525083333333334 0.918225 -3.1745083333333333 0.8416833333333333 -1.1219999999999999 -0.07654166666666667 -2.18735 -0.5213083333333333 -3.0307749999999998 -1.2651833333333333 -0.8433333333333334 -0.743875 -1.4177166666666665 -1.7453333333333332 -1.6338666666666666 -2.848908333333333'
        strokeWidth='2'
      ></path>
      <path
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M17.875 14.4375h3.4375V11'
        strokeWidth='2'
      ></path>
      <path
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M10.846916666666667 13.765674999999998c0.3641 -1.0640666666666667 1.0692000000000002 -1.9781666666666664 2.00585 -2.6005833333333332 0.93665 -0.6223249999999999 2.0525083333333334 -0.918225 3.1745083333333333 -0.8415916666666666 1.1219999999999999 0.07654166666666667 2.18735 0.5212166666666667 3.0307749999999998 1.2650916666666667 0.843425 0.743875 1.4177166666666665 1.7453333333333332 1.6338666666666666 2.8489999999999998'
        strokeWidth='2'
      ></path>
      <path
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M7.5625 18.5625h-5.5c-0.3646683333333333 0 -0.7144133333333333 -0.14483333333333334 -0.9722716666666665 -0.40269166666666667C0.8323654166666666 17.90195 0.6875 17.55215 0.6875 17.1875V2.0625c0 -0.3646683333333333 0.14486541666666666 -0.7144133333333333 0.4027283333333333 -0.9722716666666665C1.3480866666666667 0.8323654166666666 1.6978316666666666 0.6875 2.0625 0.6875h9.74325c0.364375 0.00007791666666666667 0.7139 0.14481683333333334 0.9716666666666667 0.40241666666666664l2.6326666666666663 2.6326666666666663c0.25758333333333333 0.25776666666666664 0.402325 0.6072458333333333 0.40241666666666664 0.9716666666666667V7.5625'
        strokeWidth='2'
      ></path>
      <path
        fill='none'
        stroke='currentColor'
        d='M4.8125 5.84375c-0.1898508333333333 0 -0.34375 -0.15389916666666667 -0.34375 -0.34375s0.15389916666666667 -0.34375 0.34375 -0.34375'
        strokeWidth='2'
      ></path>
      <path
        stroke='currentColor'
        d='M4.8125 5.84375c0.1898508333333333 0 0.34375 -0.15389916666666667 0.34375 -0.34375s-0.15389916666666667 -0.34375 -0.34375 -0.34375'
        strokeWidth='2'
      ></path>
      <path
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        d='m11.235583333333333 9.039158333333333 -0.9230833333333331 -1.47675c-0.061966666666666656 -0.09316999999999999 -0.14565833333333333 -0.16979416666666666 -0.24401666666666666 -0.22320833333333331 -0.09826666666666667 -0.053404999999999994 -0.208175 -0.08198666666666667 -0.32000833333333334 -0.08325166666666667 -0.11183333333333333 -0.0012649999999999998 -0.22238333333333332 0.024823333333333333 -0.3218416666666667 0.07600083333333332 -0.09945833333333333 0.05116833333333333 -0.18498333333333333 0.12588583333333334 -0.24896666666666667 0.21762583333333332l-1.8333333333333333 2.6134166666666667 -1.1293333333333333 -0.9047499999999999c-0.07439666666666667 -0.059675 -0.16038 -0.10313416666666667 -0.2524866666666667 -0.12775583333333332 -0.09210666666666666 -0.0246125 -0.18833833333333333 -0.02980083333333333 -0.2825533333333333 -0.015234999999999999 -0.09422416666666666 0.014575 -0.18438749999999998 0.04857416666666667 -0.2647608333333333 0.0999075 -0.0803825 0.051241666666666665 -0.14920583333333332 0.11870833333333333 -0.20211583333333333 0.19799999999999998l-1.7755833333333333 3.64925H8.25'
        strokeWidth='2'
      ></path>
    </svg>
  );

  app.$icon.register(
    'toolkit-eye-close',
    <svg viewBox='0 0 24 24'>
      {' '}
      <path
        fill='currentColor'
        d='M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z'
      />{' '}
    </svg>
  );

  app.$icon.register(
    'toolkit-eye-open',
    <svg viewBox='0 0 24 24'>
      {' '}
      <path
        fill='currentColor'
        d='M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z'
      />{' '}
    </svg>
  );

  app.$icon.register(
    'toolkit-diamond',
    <svg viewBox='-0.5 -0.5 24 24' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M18.435458333333333 3.090625a1.4375 1.4375 0 0 0 -1.15 -0.575h-11.5a1.4375 1.4375 0 0 0 -1.15 0.575L1.4375 7.356166666666667a1.4375 1.4375 0 0 0 0.046000000000000006 1.7825000000000002l8.948916666666666 10.829166666666667a1.4375 1.4375 0 0 0 2.2041666666666666 0l8.948916666666666 -10.829166666666667a1.4375 1.4375 0 0 0 0.046000000000000006 -1.7825000000000002Z'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1'
      ></path>
      <path
        d='m5.126125 2.6756666666666664 6.4093333333333335 17.808708333333332'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1'
      ></path>
      <path
        d='m17.943833333333334 2.6756666666666664 -6.408375 17.808708333333332'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1'
      ></path>
      <path
        d='m1.1480833333333333 8.265625 20.76995833333333 0'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1'
      ></path>
      <path
        d='m7.222958333333334 8.265625 4.3125 -5.75 4.3125 5.75'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1'
      ></path>
    </svg>
  );

  app.$icon.register(
    'toolkit-diamond-shine',
    <svg viewBox='-0.5 -0.5 24 24' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='m11.5 22.273583333333335 5.75 -5.75 0 -10.0625 -5.75 -5.75 -5.75 5.75 0 10.0625 5.75 5.75z'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1'
      ></path>
      <path
        d='m11.5 0.7110833333333334 0 21.5625'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1'
      ></path>
      <path
        d='m5.75 6.461083333333334 11.5 0'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1'
      ></path>
      <path
        d='m5.75 16.523583333333335 11.5 0'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1'
      ></path>
      <path
        d='m20.125 11.492333333333335 2.15625 0'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1'
      ></path>
      <path
        d='m19.40625 3.5860833333333333 1.4375 -1.4375'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1'
      ></path>
      <path
        d='m19.40625 19.398583333333335 1.4375 1.4375'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1'
      ></path>
      <path
        d='m2.875 11.492333333333335 -2.15625 0'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1'
      ></path>
      <path
        d='m3.59375 3.5860833333333333 -1.4375 -1.4375'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1'
      ></path>
      <path
        d='m3.59375 19.398583333333335 -1.4375 1.4375'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1'
      ></path>
    </svg>
  );

  app.$icon.register(
    'toolkit-empty-small-script',
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 20'>
      <path
        fill='currentcolor'
        d='M15,16A1,1 0 0,0 16,15V4H8A1,1 0 0,0 7,5V14H5V5A3,3 0 0,1 8,2H19A3,3 0 0,1 22,5V6H20V5A1,1 0 0,0 19,4A1,1 0 0,0 18,5V9L18,15A3,3 0 0,1 15,18H5A3,3 0 0,1 2,15V14H13A2,2 0 0,0 15,16'
      />
    </svg>
  );

  app.$icon.register(
    'toolkit-pin',
    <svg viewBox='0 0 24 24' height='48' width='48'>
      <path
        d='M12,0C6.21,0,1.5,4.26,1.5,9.5c0,5.75,7.3,12.29,9.54,14.15a1.49,1.49,0,0,0,1.92,0c2.24-1.87,9.54-8.4,9.54-14.15C22.5,4.26,17.79,0,12,0Zm0,15a5.5,5.5,0,1,1,5.5-5.5A5.51,5.51,0,0,1,12,15Z'
        fill='currentColor'
      ></path>
    </svg>
  );

  app.$icon.register(
    'toolkit-check-mark',
    <svg viewBox='0 0 24 24'>
      {' '}
      <path fill='currentColor' d='M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z' />{' '}
    </svg>
  );

  app.$icon.register(
    'toolkit-trash',
    <svg viewBox='0 0 24 24' strokeWidth='1.5' height='48' width='48'>
      <path
        d='M18.5,22.09a1.544,1.544,0,0,1-1.513,1.16H7.018A1.545,1.545,0,0,1,5.5,22.09L.791,2.59a1.459,1.459,0,0,1,.3-1.273A1.577,1.577,0,0,1,2.3.75H21.7a1.574,1.574,0,0,1,1.217.567,1.463,1.463,0,0,1,.3,1.273Z'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M7.339 0.75L9.669 23.25'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M16.662 0.75L14.331 23.25'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M1.796 6.75L22.204 6.75'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M3.247 12.75L20.754 12.75'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M4.697 18.75L19.304 18.75'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  );

  app.$icon.register(
    'toolkit-print',
    <svg width='800px' height='800px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M5 5C5 4.44772 5.44772 4 6 4H18C18.5523 4 19 4.44772 19 5V11C20.6569 11 22 12.3431 22 14V18C22 19.6569 20.6569 21 19 21H5C3.34314 21 2 19.6569 2 18V14C2 12.3431 3.34315 11 5 11V5ZM5 13C4.44772 13 4 13.4477 4 14V18C4 18.5523 4.44772 19 5 19H19C19.5523 19 20 18.5523 20 18V14C20 13.4477 19.5523 13 19 13V15C19 15.5523 18.5523 16 18 16H6C5.44772 16 5 15.5523 5 15V13ZM7 6V12V14H17V12V6H7ZM9 9C9 8.44772 9.44772 8 10 8H14C14.5523 8 15 8.44772 15 9C15 9.55228 14.5523 10 14 10H10C9.44772 10 9 9.55228 9 9ZM9 12C9 11.4477 9.44772 11 10 11H14C14.5523 11 15 11.4477 15 12C15 12.5523 14.5523 13 14 13H10C9.44772 13 9 12.5523 9 12Z'
      />
    </svg>
  );

  app.$icon.register(
    'toolkit-copyright',
    <svg width='800px' height='800px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M10 9C10 8.44754 10.4476 8 10.9997 8H13C13.5071 8 13.7898 8.16249 13.9378 8.28087C14.0486 8.36952 14.1077 8.45538 14.119 8.4731C14.3737 8.94812 14.962 9.13706 15.4472 8.89443C15.9309 8.65259 16.1361 8.03372 15.8934 7.55064C15.8387 7.44229 15.7712 7.34071 15.6984 7.24375C15.5859 7.09376 15.4194 6.90487 15.1872 6.71913C14.7102 6.33751 13.9929 6 13 6H10.9997C9.34271 6 8 7.34332 8 9V14.9999C8 16.6566 9.34275 17.9999 10.9998 17.9999L13 17.9999C13.9929 18 14.7101 17.6625 15.1872 17.2809C15.4194 17.0951 15.5859 16.9062 15.6984 16.7563C15.7714 16.659 15.8389 16.5568 15.8939 16.4483C16.138 15.9605 15.9354 15.3497 15.4472 15.1056C14.962 14.8629 14.3737 15.0519 14.119 15.5269C14.1077 15.5446 14.0486 15.6305 13.9378 15.7191C13.7899 15.8375 13.5071 16 13 15.9999L10.9998 15.9999C10.4476 15.9999 10 15.5524 10 14.9999V9Z' />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM12 20.9932C7.03321 20.9932 3.00683 16.9668 3.00683 12C3.00683 7.03321 7.03321 3.00683 12 3.00683C16.9668 3.00683 20.9932 7.03321 20.9932 12C20.9932 16.9668 16.9668 20.9932 12 20.9932Z'
      />
    </svg>
  );

  app.$icon.register(
    'toolkit-language',
    <svg fill='currentColor' width='800px' height='800px' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'>
      <path d='M7.41 9l2.24 2.24-.83 2L6 10.4l-3.3 3.3-1.4-1.42L4.58 9l-.88-.88c-.53-.53-1-1.3-1.3-2.12h2.2c.15.28.33.53.51.7l.89.9.88-.88C7.48 6.1 8 4.84 8 4H0V2h5V0h2v2h5v2h-2c0 1.37-.74 3.15-1.7 4.12L7.4 9zm3.84 8L10 20H8l5-12h2l5 12h-2l-1.25-3h-5.5zm.83-2h3.84L14 10.4 12.08 15z' />
    </svg>
  );

  app.$icon.register(
    'toolkit-title',
    <svg width='800px' height='800px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M12 6V19M6 6H18' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );

  app.$icon.register(
    'toolkit-color-palette',
    <svg width='800px' height='800px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M14 12.5001C14 13.3285 13.3284 14.0001 12.5 14.0001C11.6716 14.0001 11 13.3285 11 12.5001C11 11.6717 11.6716 11.0001 12.5 11.0001C13.3284 11.0001 14 11.6717 14 12.5001Z' />
      <path d='M16.5 10.0001C17.3284 10.0001 18 9.32854 18 8.50011C18 7.67169 17.3284 7.00011 16.5 7.00011C15.6716 7.00011 15 7.67169 15 8.50011C15 9.32854 15.6716 10.0001 16.5 10.0001Z' />
      <path d='M13 6.50011C13 7.32854 12.3284 8.00011 11.5 8.00011C10.6716 8.00011 10 7.32854 10 6.50011C10 5.67169 10.6716 5.00011 11.5 5.00011C12.3284 5.00011 13 5.67169 13 6.50011Z' />
      <path d='M7.50001 12.0001C8.32844 12.0001 9.00001 11.3285 9.00001 10.5001C9.00001 9.67169 8.32844 9.00011 7.50001 9.00011C6.67158 9.00011 6.00001 9.67169 6.00001 10.5001C6.00001 11.3285 6.67158 12.0001 7.50001 12.0001Z' />
      <path d='M14 17.5001C14 18.3285 13.3284 19.0001 12.5 19.0001C11.6716 19.0001 11 18.3285 11 17.5001C11 16.6717 11.6716 16.0001 12.5 16.0001C13.3284 16.0001 14 16.6717 14 17.5001Z' />
      <path d='M7.50001 17.0001C8.32844 17.0001 9.00001 16.3285 9.00001 15.5001C9.00001 14.6717 8.32844 14.0001 7.50001 14.0001C6.67158 14.0001 6.00001 14.6717 6.00001 15.5001C6.00001 16.3285 6.67158 17.0001 7.50001 17.0001Z' />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M11.5017 1.02215C15.4049 0.791746 19.5636 2.32444 21.8087 5.41131C22.5084 6.37324 22.8228 7.63628 22.6489 8.83154C22.471 10.054 21.7734 11.2315 20.4472 11.8945C19.6389 12.2987 18.7731 12.9466 18.2401 13.668C17.7158 14.3778 17.6139 14.9917 17.8944 15.5529C18.4231 16.6102 18.8894 17.9257 18.8106 19.1875C18.7699 19.8375 18.5828 20.4946 18.1664 21.0799C17.7488 21.6667 17.1448 22.1192 16.3714 22.4286C14.6095 23.1333 12.6279 23.1643 10.8081 22.8207C8.98579 22.4765 7.24486 21.7421 5.92656 20.8194C4.00568 19.4748 2.47455 17.6889 1.71371 15.4464C0.9504 13.1965 0.995912 10.5851 2.06024 7.65803C3.64355 3.30372 7.56248 1.25469 11.5017 1.02215ZM11.6196 3.01868C8.26589 3.21665 5.18483 4.9176 3.93984 8.34149C3.00414 10.9148 3.01388 13.0536 3.60768 14.8038C4.20395 16.5613 5.42282 18.0255 7.07347 19.1809C8.14405 19.9303 9.6169 20.5604 11.1792 20.8554C12.7442 21.151 14.3181 21.0959 15.6286 20.5716C16.308 20.2999 16.7678 19.8099 16.8145 19.0627C16.8606 18.3245 16.5769 17.3901 16.1056 16.4473C15.3639 14.9639 15.8542 13.5318 16.6315 12.4796C17.4002 11.4391 18.5455 10.6093 19.5528 10.1057C20.2266 9.76878 20.5747 9.19623 20.6697 8.54355C20.7686 7.86365 20.5831 7.12638 20.1913 6.58769C18.4364 4.17486 15.0093 2.81858 11.6196 3.01868Z'
      />
    </svg>
  );

  app.$icon.register(
    'toolkit-small-script',
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 20'>
      <path
        fill='currentcolor'
        d='M15,16A1,1 0 0,0 16,15V4H8A1,1 0 0,0 7,5V14H5V5A3,3 0 0,1 8,2H19A3,3 0 0,1 22,5V6H20V5A1,1 0 0,0 19,4A1,1 0 0,0 18,5V9L18,15A3,3 0 0,1 15,18H5A3,3 0 0,1 2,15V14H13A2,2 0 0,0 15,16M9,6H14V8H9V6M9,10H14V12H9V10Z'
      />
    </svg>
  );

  app.$icon.register(
    'toolkit-origami-sword',
    <svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'>
      <g id='a' />
      <g id='b' />
      <g id='c' />
      <g id='d' />
      <g id='e' />
      <g id='f' />
      <g id='g' />
      <g id='h' />
      <g id='i' />
      <g id='j'>
        <path d='M57.4,4.44l-7.28-.43c-1.02-.06-2.02,.32-2.74,1.04L22.57,29.86l-1.47-1.47,4.33-4.33c.56-.57,.56-1.49,0-2.05-.29-.29-.67-.45-1.08-.43l-8.99,.32c-1.18,.04-2.12,1-2.15,2.17l-.3,12.19-1.82,1.82c-.84,.84-.84,2.21,0,3.05l1.83,1.83-8.29,8.29c-.84,.84-.84,2.21,0,3.05l5.07,5.07c.42,.42,.97,.63,1.52,.63s1.1-.21,1.52-.63l8.29-8.29,1.83,1.83c.41,.41,.95,.63,1.52,.63h0c.58,0,1.12-.22,1.52-.63l1.82-1.82,12.19-.3c1.18-.03,2.13-.97,2.17-2.15l.32-8.99c.03-.8-.6-1.48-1.41-1.51-.4,0-.79,.14-1.08,.43l-4.33,4.33-1.47-1.47,24.81-24.81c.72-.72,1.1-1.72,1.04-2.74l-.43-7.28c-.07-1.16-1-2.09-2.16-2.16Zm-8.6,2.02c.32-.32,.75-.49,1.2-.46l6.21,.37-28.57,28.57-3.66-3.66L48.8,6.46Zm-23.51,28.95l-10.36,.25,.26-10.36,10.11,10.11Zm-5.6-8.43l-3.12-3.12,6.47-.23-3.35,3.35Zm-5.36,17.4l1.94,1.94-4.98,4.98-4.17,.29,7.21-7.21Zm-7.55,9.24l3.88-.27-.27,3.88-3.6-3.6Zm5.63,3.26l.29-4.17,4.98-4.98,1.94,1.94-7.21,7.21Zm12.09-5.38s-.08,.05-.11,.05-.07,0-.11-.05l-11.77-11.77c-.06-.06-.06-.16,0-.22l1.82-1.82,12.3-.3-.3,12.3-1.82,1.82Zm15.87-10.53l-.23,6.47-3.12-3.12,3.35-3.35Zm-1.67,7.86l-10.36,.25,.25-10.36,10.11,10.11ZM57.54,15.2l-24.81,24.81-3.66-3.66L57.63,7.79l.37,6.21c.03,.45-.14,.89-.46,1.2Z' />
      </g>
      <g id='k' />
      <g id='l' />
      <g id='m' />
      <g id='n' />
      <g id='o' />
      <g id='p' />
      <g id='q' />
      <g id='r' />
      <g id='s' />
      <g id='t' />
      <g id='u' />
      <g id='v' />
      <g id='w' />
      <g id='x' />
      <g id='y' />
      <g id='a`' />
      <g id='aa' />
      <g id='ab' />
      <g id='ac' />
      <g id='ad' />
      <g id='ae' />
      <g id='af' />
      <g id='ag' />
      <g id='ah' />
      <g id='ai' />
      <g id='aj' />
      <g id='ak' />
      <g id='al' />
      <g id='am' />
      <g id='an' />
      <g id='ao' />
      <g id='ap' />
      <g id='aq' />
      <g id='ar' />
      <g id='as' />
      <g id='at' />
      <g id='au' />
      <g id='av' />
      <g id='aw' />
      <g id='ax' />
    </svg>
  );

  app.$icon.register(
    'toolkit-id',
    <svg
      width='800px'
      height='800px'
      viewBox='0 0 64 64'
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
      role='img'
      preserveAspectRatio='xMidYMid meet'
    >
      <path d='M39 19.434h-5.384v25.133H39c2.969 0 5.386-2.322 5.386-5.174V24.609c0-2.853-2.417-5.175-5.386-5.175'></path>
      <path d='M52 2H12C6.477 2 2 6.477 2 12v40c0 5.523 4.477 10 10 10h40c5.523 0 10-4.477 10-10V12c0-5.523-4.477-10-10-10M23 49h-4V15h4v34m26-9.607a9.251 9.251 0 0 1-.787 3.738a9.592 9.592 0 0 1-2.143 3.055a10.032 10.032 0 0 1-3.178 2.059A10.302 10.302 0 0 1 39 49H29V15h10c1.348 0 2.657.254 3.893.754c1.19.484 2.26 1.176 3.178 2.059s1.638 1.912 2.143 3.053A9.294 9.294 0 0 1 49 24.609v14.784'></path>
    </svg>
  );

  app.$icon.register(
    'toolkit-sticker',
    <svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
      <path d='M20,11.5 L20,7.5 C20,5.56700338 18.4329966,4 16.5,4 L7.5,4 C5.56700338,4 4,5.56700338 4,7.5 L4,16.5 C4,18.4329966 5.56700338,20 7.5,20 L12.5,20 C13.3284271,20 14,19.3284271 14,18.5 L14,16.5 C14,14.5670034 15.5670034,13 17.5,13 L18.5,13 C19.3284271,13 20,12.3284271 20,11.5 Z M19.9266247,13.5532532 C19.522053,13.8348821 19.0303092,14 18.5,14 L17.5,14 C16.1192881,14 15,15.1192881 15,16.5 L15,18.5 C15,18.9222858 14.8952995,19.3201175 14.7104416,19.668952 C17.4490113,18.8255402 19.5186665,16.4560464 19.9266247,13.5532532 L19.9266247,13.5532532 Z M7.5,3 L16.5,3 C18.9852814,3 21,5.01471863 21,7.5 L21,12.5 C21,17.1944204 17.1944204,21 12.5,21 L7.5,21 C5.01471863,21 3,18.9852814 3,16.5 L3,7.5 C3,5.01471863 5.01471863,3 7.5,3 Z' />
    </svg>
  );

  app.$icon.register(
    'toolkit-card',
    <svg viewBox='0 0 24 24'>
      <path
        fill='currentColor'
        d='M20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20M5,13V15H16V13H5M5,9V11H19V9H5Z'
      />
    </svg>
  );

  app.$icon.register(
    'toolkit-hash',
    <svg viewBox='-2 -2 128 128' xmlns='http://www.w3.org/2000/svg' height='128' width='128'>
      <path
        d='m19.374999999999996 42.61466666666666 100.74999999999999 0'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='8'
      ></path>
      <path
        d='m3.8749999999999996 89.11466666666666 100.74999999999999 0'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='8'
      ></path>
      <path
        d='m61.99999999999999 3.864666666666666 -38.74999999999999 116.24999999999999'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='8'
      ></path>
      <path
        d='m100.74999999999999 3.864666666666666 -38.74999999999999 116.24999999999999'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='8'
      ></path>
    </svg>
  );

  app.$icon.register(
    'toolkit-error-circle',
    <svg fill='none' viewBox='-0.5 -0.5 14 14'>
      <g id='warning-circle--warning-alert-frame-exclamation-caution-circle'>
        <path
          id='Vector'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M6.5 12.536a6.036 6.036 0 1 0 0 -12.071 6.036 6.036 0 0 0 0 12.071Z'
          strokeWidth='1'
        ></path>
        <path
          id='Vector_2'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M6.5 3.714v3.018'
          strokeWidth='1'
        ></path>
        <g id='Group 2605'>
          <path
            id='Ellipse 1111'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M6.5 9.286a0.232 0.232 0 0 1 0 -0.464'
            strokeWidth='1'
          ></path>
          <path
            id='Ellipse 1112'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M6.5 9.286a0.232 0.232 0 0 0 0 -0.464'
            strokeWidth='1'
          ></path>
        </g>
      </g>
    </svg>
  );

  app.$icon.register(
    'toolkit-info-circle',
    <svg viewBox='0 0 14 14' height='48' width='48'>
      <g>
        <circle
          cx='7'
          cy='7'
          r='6.5'
          fill='none'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
        ></circle>
        <line
          x1='7'
          y1='7'
          x2='7'
          y2='10.5'
          fill='none'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
        ></line>
        <circle
          cx='7'
          cy='4.5'
          r='0.5'
          fill='none'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
        ></circle>
      </g>
    </svg>
  );

  app.$icon.register(
    'toolkit-image',
    <svg viewBox='0 0 14 14' height='48' width='48'>
      <g>
        <rect
          x='0.5'
          y='0.5'
          width='13'
          height='13'
          rx='1'
          transform='translate(14 14) rotate(180)'
          fill='none'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
        ></rect>
        <line
          x1='0.5'
          y1='11'
          x2='13.5'
          y2='11'
          fill='none'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
        ></line>
        <path
          d='M3.84,11,9.05,6.12a.5.5,0,0,1,.64,0L13.5,8.85'
          fill='none'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
        ></path>
        <circle
          cx='4.5'
          cy='4.5'
          r='1.5'
          fill='none'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
        ></circle>
      </g>
    </svg>
  );

  app.$icon.register(
    'toolkit-lock-opened',
    <svg viewBox='0 0 32 32' version='1.1' xmlns='http://www.w3.org/2000/svg'>
      <path d='M25 12.034l-14.28 0-0.518-2.321c-0.883-3.293 0.65-6.576 4.159-7.516 3.473-0.93 6.534 1.061 7.432 4.41l0.425 1.686c0.143 0.534 0.691 0.85 1.225 0.707s0.85-0.691 0.707-1.225l-0.425-1.687c-1.187-4.433-5.325-7.045-9.881-5.824-4.574 1.226-6.741 5.607-5.573 9.966l0.402 1.803h-1.673c-2.206 0-4 1.794-4 4v12c0 2.206 1.794 4 4 4h18c2.206 0 4-1.794 4-4v-12c0-2.206-1.794-4-4-4zM27 28.035c0 1.102-0.898 2-2 2h-18c-1.103 0-2-0.898-2-2v-12c0-1.102 0.897-2 2-2h18c1.102 0 2 0.898 2 2v12zM16 18.035c-1.104 0-2 0.895-2 2 0 0.738 0.405 1.376 1 1.723v3.277c0 0.552 0.448 1 1 1s1-0.448 1-1v-3.277c0.595-0.346 1-0.985 1-1.723 0-1.105-0.895-2-2-2z'></path>
    </svg>
  );

  app.$icon.register(
    'toolkit-lock-closed',
    <svg viewBox='0 0 32 32' version='1.1' xmlns='http://www.w3.org/2000/svg'>
      <path d='M25 12h-1v-3.816c0-4.589-3.32-8.184-8.037-8.184-4.736 0-7.963 3.671-7.963 8.184v3.816h-1c-2.206 0-4 1.794-4 4v12c0 2.206 1.794 4 4 4h18c2.206 0 4-1.794 4-4v-12c0-2.206-1.794-4-4-4zM10 8.184c0-3.409 2.33-6.184 5.963-6.184 3.596 0 6.037 2.716 6.037 6.184v3.816h-12v-3.816zM27 28c0 1.102-0.898 2-2 2h-18c-1.103 0-2-0.898-2-2v-12c0-1.102 0.897-2 2-2h18c1.102 0 2 0.898 2 2v12zM16 18c-1.104 0-2 0.895-2 2 0 0.738 0.405 1.376 1 1.723v3.277c0 0.552 0.448 1 1 1s1-0.448 1-1v-3.277c0.595-0.346 1-0.985 1-1.723 0-1.105-0.895-2-2-2z'></path>
    </svg>
  );

  app.$icon.register(
    'toolkit-minus',
    <svg viewBox='0 0 24 24'>
      <path d='M19,13H5V11H19V13Z' />
    </svg>
  );

  app.$icon.register(
    'toolkit-folder-image',
    <svg viewBox='0 0 24 24'>
      {' '}
      <path
        stroke='currentColor'
        d='M5,17L9.5,11L13,15.5L15.5,12.5L19,17M20,6H12L10,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8A2,2 0 0,0 20,6Z'
      />{' '}
    </svg>
  );

  app.$icon.register(
    'toolkit-sword',
    <svg viewBox='-0.75 -0.75 48 48' xmlns='http://www.w3.org/2000/svg' height='48' width='48'>
      <path
        d='M19.326562499999998 35.4659375 11.043750000000001 27.173437500000002 35.547312500000004 2.6601875a1.46475 1.46475 0 0 1 0.87575 -0.4204375l6.9963125 -0.775a1.4666875 1.4666875 0 0 1 1.6178124999999999 1.6178124999999999l-0.775 6.9963125a1.46475 1.46475 0 0 1 -0.4204375 0.87575Z'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='3.5'
      ></path>
      <path
        d='m12.070625000000001 28.21 -9.329062500000001 9.329062500000001a4.398125 4.398125 0 0 0 6.219375 6.219375L18.29 34.429375Z'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='3.5'
      ></path>
      <path
        d='m7.9243749999999995 24.06375 14.511875 14.511875'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='3.5'
      ></path>
      <path
        d='m35.9115625 10.5884375 -20.73125 20.73125'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='3.5'
      ></path>
    </svg>
  );

  app.$icon.register(
    'toolkit-shield',
    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='-0.75 -0.75 48 48' height='48' width='48'>
      <path
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M24.4283875 44.1815875c-0.7538812500000001 0.29585625 -1.5937875 0.29585625 -2.3571625 0C9.980062499999999 39.51511875 2.001999375 27.891475 1.9829149999999998 14.922411875V5.369723125c0 -1.803638125 1.4696325 -3.2732900000000003 3.2732900000000003 -3.2732900000000003H41.24336875c1.8036187499999998 0 3.2732125 1.469651875 3.2732125 3.2732900000000003v9.55268875c-0.00949375 12.959569375000001 -7.997031250000001 24.583019375 -20.08819375 29.249681875v0.00949375Z'
        strokeWidth='3.5'
      ></path>
      <path
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M23.95466875 34.441c-0.4506625 0.17069375 -0.9526687500000001 0.17069375 -1.40895 0 -7.2280375 -2.6919625 -11.997251875 -9.39668125 -12.00866375 -16.87775625V12.052935625c0 -1.040418125 0.87854 -1.888151875 1.956739375 -1.888151875H34.0066125c1.07821875 0 1.956875 0.84773375 1.956875 1.888151875V17.563243749999998c-0.0058125 7.47545625 -4.7807812499999995 14.18036875 -12.00881875 16.8721375v0.00561875Z'
        strokeWidth='3.5'
      ></path>
    </svg>
  );

  app.$icon.register(
    'toolkit-script',
    <svg viewBox='0 0 24 24'>
      <path
        fill='currentcolor'
        d='M15,20A1,1 0 0,0 16,19V4H8A1,1 0 0,0 7,5V16H5V5A3,3 0 0,1 8,2H19A3,3 0 0,1 22,5V6H20V5A1,1 0 0,0 19,4A1,1 0 0,0 18,5V9L18,19A3,3 0 0,1 15,22H5A3,3 0 0,1 2,19V18H13A2,2 0 0,0 15,20M9,6H14V8H9V6M9,10H14V12H9V10M9,14H14V16H9V14Z'
      />
    </svg>
  );

  app.$icon.register(
    'toolkit-pen',
    <svg viewBox='0 0 14 14' height='48' width='48'>
      <g>
        <line
          x1='0.5'
          y1='13.5'
          x2='2.5'
          y2='11.5'
          fill='none'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
        ></line>
        <path
          d='M4.71,12.29a1,1,0,0,1-1.42,0L1.71,10.71a1,1,0,0,1,0-1.42L9.88,1.12a2.12,2.12,0,0,1,3,3Z'
          fill='none'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
        ></path>
        <path
          d='M11.5,5.5,7.21,1.21a1,1,0,0,0-1.42,0L2.5,4.5'
          fill='none'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
        ></path>
      </g>
    </svg>
  );

  app.$icon.register(
    'toolkit-star-outline',
    <svg viewBox='0 0 24 24'>
      {' '}
      <path d='M12,15.39L8.24,17.66L9.23,13.38L5.91,10.5L10.29,10.13L12,6.09L13.71,10.13L18.09,10.5L14.77,13.38L15.76,17.66M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z' />{' '}
    </svg>
  );

  app.$icon.register(
    'toolkit-star',
    <svg viewBox='0 0 24 24'>
      {' '}
      <path d='M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z' />{' '}
    </svg>
  );

  app.$icon.register(
    'toolkit-close',
    <svg viewBox='0 0 24 24'>
      <path
        fill='currentColor'
        d='M13.46,12L19,17.54V19H17.54L12,13.46L6.46,19H5V17.54L10.54,12L5,6.46V5H6.46L12,10.54L17.54,5H19V6.46L13.46,12Z'
      />
    </svg>
  );

  app.$icon.register(
    'toolkit-plus',
    <svg viewBox='0 0 24 24'>
      <path fill='currentColor' d='M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z' />
    </svg>
  );

  app.$icon.register(
    'toolkit-angle-down',
    <svg viewBox='0 0 24 24'>
      {' '}
      <path d='M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z' fill='currentColor' />{' '}
    </svg>
  );

  app.$icon.register(
    'toolkit-angle-left',
    <svg viewBox='-1 -1 24 24' version='1.1' id='svg837'>
      <defs id='defs841' />{' '}
      <path
        d='M 13.25561,17.936813 6.6455982,11.326801 a 0.46183755,0.46183755 0 0 1 0,-0.653602 L 13.25561,4.0631875'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.16725'
        id='path835'
      />
    </svg>
  );

  app.$icon.register(
    'toolkit-angle-right',
    <svg viewBox='-1 -1 24 24' version='1.1' id='svg4'>
      <defs id='defs8' />
      <path
        d='m 6.7293532,4.1607839 6.5170128,6.5170131 a 0.45533981,0.45533981 0 0 1 0,0.644406 l -6.5170128,6.517013'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.32639'
        id='path2'
      />{' '}
    </svg>
  );

  app.$icon.register(
    'toolkit-angle-up',
    <svg viewBox='0 0 24 24'>
      <path d='M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z' fill='currentColor' />
    </svg>
  );

  app.$icon.register(
    'toolkit-cog',
    <svg viewBox='0 0 14 14' height='48' width='48' strokeWidth='1'>
      <path
        d='M5.23,2.25l.43-1.11A1,1,0,0,1,6.59.5h.82a1,1,0,0,1,.93.64l.43,1.11,1.46.84,1.18-.18a1,1,0,0,1,1,.49l.4.7a1,1,0,0,1-.08,1.13L12,6.16V7.84l.75.93a1,1,0,0,1,.08,1.13l-.4.7a1,1,0,0,1-1,.49l-1.18-.18-1.46.84-.43,1.11a1,1,0,0,1-.93.64H6.59a1,1,0,0,1-.93-.64l-.43-1.11-1.46-.84-1.18.18a1,1,0,0,1-1-.49l-.4-.7a1,1,0,0,1,.08-1.13L2,7.84V6.16l-.75-.93A1,1,0,0,1,1.17,4.1l.4-.7a1,1,0,0,1,1-.49l1.18.18ZM5,7A2,2,0,1,0,7,5,2,2,0,0,0,5,7Z'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  );

  app.$icon.register(
    'toolkit-menu-candy-box',
    <svg viewBox='0 0 24 24'>
      <path d='M12 16C13.1 16 14 16.9 14 18S13.1 20 12 20 10 19.1 10 18 10.9 16 12 16M12 10C13.1 10 14 10.9 14 12S13.1 14 12 14 10 13.1 10 12 10.9 10 12 10M12 4C13.1 4 14 4.9 14 6S13.1 8 12 8 10 7.1 10 6 10.9 4 12 4M6 16C7.1 16 8 16.9 8 18S7.1 20 6 20 4 19.1 4 18 4.9 16 6 16M6 10C7.1 10 8 10.9 8 12S7.1 14 6 14 4 13.1 4 12 4.9 10 6 10M6 4C7.1 4 8 4.9 8 6S7.1 8 6 8 4 7.1 4 6 4.9 4 6 4M18 16C19.1 16 20 16.9 20 18S19.1 20 18 20 16 19.1 16 18 16.9 16 18 16M18 10C19.1 10 20 10.9 20 12S19.1 14 18 14 16 13.1 16 12 16.9 10 18 10M18 4C19.1 4 20 4.9 20 6S19.1 8 18 8 16 7.1 16 6 16.9 4 18 4Z' />
    </svg>
  );

  app.$icon.register(
    'toolkit-menu-handburger',
    <svg viewBox='0 0 24 24'>
      {' '}
      <path fill='currentColor' d='M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z' />{' '}
    </svg>
  );

  app.$icon.register(
    'toolkit-menu-kebab',
    <svg viewBox='0 0 24 24'>
      <path
        fill='currentColor'
        d='M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z'
      />
    </svg>
  );

  app.$icon.register(
    'toolkit-menu-meatballs',
    <svg viewBox='0 0 24 24'>
      <path
        fill='currentcolor'
        d='M16,12A2,2 0 0,1 18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12M10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12M4,12A2,2 0 0,1 6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12Z'
      />
    </svg>
  );
}
