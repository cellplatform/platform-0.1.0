const GOOGLE_BASE = 'https://fonts.googleapis.com/css';
const GOOGLE_ROBOTO = 'Roboto:100,300,300i,400,400i,900';

/**
 * <link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Roboto:300,300i,400,400i,900' />
 */
export const ROBOTO = {
  GOOGLE_FONTS: {
    FAMILY: GOOGLE_ROBOTO,
    URL: `${GOOGLE_BASE}?family=${GOOGLE_ROBOTO}`,
  },
  FAMILY: `'Roboto', sans-serif`,
  WEIGHTS: {
    THIN: 100,
    LIGHT: 300,
    NORMAL: 400,
    BOLD: 900,
  },
};

export const MONOSPACE = {
  FAMILY: `Menlo, Monaco, 'Lucida Console', Courier, monospace`,
};

export const COLORS = {
  WHITE: '#fff',
  BLACK: '#fff',
  DARK: '#293042', // Inky blue/black.
};
