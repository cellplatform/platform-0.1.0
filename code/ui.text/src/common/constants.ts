const GOOGLE = {
  BASE: 'https://fonts.googleapis.com/css',
  ROBOTO: 'Roboto:100,300,300i,400,400i,900',
  ROBOTO_MONO: 'Roboto+Mono',
};
const toGoogleUrl = (family: string) => `${GOOGLE.BASE}?family=${family}`;

/**
 * Import:
 *
 *  - CODE:   css.head.importStylesheet(ROBOTO.GOOGLE.URL)
 *  - LINK:   <link href='https://fonts.googleapis.com/css?family=Roboto:300,300i,400,400i,900&display=swap' rel='stylesheet' />
 *  - IMPORT: @import url('https://fonts.googleapis.com/css?family=Roboto:300,300i,400,400i,900&display=swap')
 *
 */
export const ROBOTO = {
  FAMILY: `'Roboto', sans-serif`,
  WEIGHTS: {
    THIN: 100,
    LIGHT: 300,
    NORMAL: 400,
    BOLD: 900,
  },
  GOOGLE: {
    FAMILY: GOOGLE.ROBOTO,
    URL: toGoogleUrl(GOOGLE.ROBOTO),
  },
};

/**
 * Import:
 *
 *  - CODE:   css.head.importStylesheet(MONOSPACE.GOOGLE.URL)
 *  - LINK:   <link href="https://fonts.googleapis.com/css?family=Roboto+Mono&display=swap" rel="stylesheet">
 *  - IMPORT: @import url('https://fonts.googleapis.com/css?family=Roboto+Mono&display=swap')
 *
 */
export const MONOSPACE = {
  FAMILY: `Roboto Mono, Menlo, Monaco, 'Lucida Console', Courier, monospace`,
  GOOGLE: {
    FAMILY: GOOGLE.ROBOTO_MONO,
    URL: toGoogleUrl(GOOGLE.ROBOTO_MONO),
  },
};

export const COLORS = {
  WHITE: '#fff',
  BLACK: '#fff',
  DARK: '#293042', // Inky blue/black.
};
