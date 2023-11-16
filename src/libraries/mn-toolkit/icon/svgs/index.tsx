declare global {
  interface ISvgIcons {
    'toolkit-close': ISvgIcons;
    'toolkit-plus': ISvgIcons;
    'toolkit-angle-down': ISvgIcons;
    'toolkit-angle-left': ISvgIcons;
    'toolkit-angle-right': ISvgIcons;
    'toolkit-angle-up': ISvgIcons;
  }
}

export function loadSvgs() {
  app.$icon.register('toolkit-close', <svg viewBox="0 0 24 24"><path fill="currentColor" d="M13.46,12L19,17.54V19H17.54L12,13.46L6.46,19H5V17.54L10.54,12L5,6.46V5H6.46L12,10.54L17.54,5H19V6.46L13.46,12Z" /></svg>);
  app.$icon.register('toolkit-plus', <svg  viewBox="0 0 24 24"><path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg>);
  app.$icon.register('toolkit-angle-down', <svg viewBox="0 0 24 24"> <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" fill="currentColor"/> </svg>);
  app.$icon.register('toolkit-angle-left', <svg        viewBox="-1 -1 24 24" version="1.1" id="svg837"  >  <defs id="defs841" />  <path d="M 13.25561,17.936813 6.6455982,11.326801 a 0.46183755,0.46183755 0 0 1 0,-0.653602 L 13.25561,4.0631875" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16725" id="path835" /> </svg>);
  app.$icon.register('toolkit-angle-right', <svg        viewBox="-1 -1 24 24" version="1.1" id="svg4"  >  <defs id="defs8" />  <path d="m 6.7293532,4.1607839 6.5170128,6.5170131 a 0.45533981,0.45533981 0 0 1 0,0.644406 l -6.5170128,6.517013" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.32639" id="path2" /> </svg>);
  app.$icon.register('toolkit-angle-up', <svg viewBox="0 0 24 24"> <path d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" fill="currentColor" /> </svg>);
}
