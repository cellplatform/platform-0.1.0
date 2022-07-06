import { Color, Style, COLORS, FONT } from '../common';
import { Markdown } from './Markdown';

const SERIF = FONT.MERRIWEATHER.regular.normal.family;

Style.global(
  {
    h1: {
      fontSize: 26,
      fontFamily: SERIF,
      marginTop: '2.3em',
      ':first-child': { marginTop: 0 },
    },
    h2: {
      fontSize: 26,
      fontFamily: SERIF,
      opacity: 0.5,
      marginTop: '2em',
      ':first-child': { marginTop: 0 },
    },
    h3: {
      textTransform: 'uppercase',
      marginTop: '2.3em',
      fontSize: 18,
    },
    h4: {
      textTransform: 'uppercase',
      marginTop: '2em',
      opacity: 0.6,
      fontSize: 18,
    },
    p: {
      fontFamily: SERIF,
      fontSize: 16,
      lineHeight: '1.8em',
      marginTop: '1.2em',
      ':first-child': { marginTop: 0 },
      ':last-child': { marginBottom: 0 },
    },
    a: { color: COLORS.BLUE },
    'ul, ol': {
      lineHeight: '1.7em',
      marginTop: 40,
      marginBottom: 40,
    },
    li: { marginBottom: 16 },
    hr: {
      border: 'none',
      borderTop: `solid 3px ${Color.format(-0.1)}`,
      marginTop: 50,
      marginBottom: 50,
    },
  },

  { prefix: `.${Markdown.className}` },
);
