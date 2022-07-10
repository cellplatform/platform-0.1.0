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
      marginTop: 40,
      marginBottom: 40,
      paddingLeft: '2.0em',
      lineHeight: '1.7em',
      fontFamily: SERIF,
    },
    li: {
      paddingLeft: '0.7em',
      marginBottom: 16,
    },
    hr: {
      border: 'none',
      borderTop: `solid 3px ${Color.format(-0.1)}`,
      marginTop: 50,
      marginBottom: 50,
    },
    code: {
      position: 'relative',
      fontFamily: 'monospace',
      fontStyle: 'normal',
      fontWeight: 600,
      color: Color.darken(COLORS.CYAN, 6),
      backgroundColor: Color.alpha(COLORS.DARK, 0.03),
      border: `solid 1px ${Color.alpha(COLORS.DARK, 0.08)}`,
      borderRadius: 4,
      paddingLeft: 3,
      paddingRight: 3,
      marginLeft: 2,
      marginRight: 2,
    },
  },

  { prefix: `.${Markdown.className}` },
);
