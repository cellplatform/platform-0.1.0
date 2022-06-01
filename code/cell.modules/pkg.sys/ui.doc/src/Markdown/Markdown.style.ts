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
      textTransform: 'uppercase',
      marginTop: '1.7em',
      fontWeight: 900,
      opacity: 0.5,
      ':first-child': { marginTop: 0 },
    },
    p: {
      fontSize: 17,
      lineHeight: '1.7em',
      ':first-child': { marginTop: 0 },
      ':last-child': { marginBottom: 0 },
    },
    a: { color: COLORS.BLUE },
    ul: { lineHeight: '1.4em' },
    li: { marginBottom: 12 },
    hr: {
      border: 'none',
      borderTop: `solid 3px ${Color.format(-0.1)}`,
      marginTop: 50,
      marginBottom: 50,
    },
  },
  { prefix: `.${Markdown.className}` },
);
