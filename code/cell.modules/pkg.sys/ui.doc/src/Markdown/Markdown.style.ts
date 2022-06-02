import { Color, Style, COLORS } from '../common';
import { Markdown } from './Markdown';

Style.global(
  {
    h1: {
      fontSize: 26,
      letterSpacing: '-0.006em',
      marginTop: '2.3em',
      ':first-child': { marginTop: 0 },
    },
    h2: {
      fontSize: 20,
      letterSpacing: '-0.006em',
      marginTop: '2em',
      // textTransform: 'uppercase',
      // fontWeight: 900,
      // opacity: 0.9,
      ':first-child': { marginTop: 0 },
    },
    p: {
      fontSize: 16,
      lineHeight: '1.7em',
      marginTop: '1.2em',
      ':first-child': { marginTop: 0 },
      ':last-child': { marginBottom: 0 },
    },
    a: { color: COLORS.BLUE },
    'ul, ol': {
      lineHeight: '1.4em',
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
