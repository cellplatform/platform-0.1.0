import { CSS as EDITOR } from '@platform/ui.editor';
import { color, css, constants } from '../common';

export const CLASS = {
  CELL: constants.CSS.CLASS.CELL,
  MARKDOWN: EDITOR.CLASS.MARKDOWN,
};

const STYLES = {
  CELL: {
    [`.${CLASS.CELL}.p-content`]: {
      // Reset CSS from handsontable.
      all: 'unset',
      whiteSpace: 'normal',

      // Base cell styles.
      boxSizing: 'border-box',
      pointerEvents: 'none',
      fontSize: 14,
      color: color.format(-0.7),
      marginTop: 2,
    },
    [`.${CLASS.CELL}.p-content.p-first-row`]: {
      marginTop: 1,
    },
  },

  MARKDOWN: {
    '*': {
      // Reset Handontable CSS that messes with the cell markdown-styles.
      paddingInlineStart: 0,
      marginBlockStart: 0,
      marginBlockEnd: 0,
      whiteSpace: 'normal',
    },
    'h1, h2': {
      borderBottom: 'none',
      paddingBottom: 0,
    },
    h1: { fontSize: '1.4em', margin: 0, marginBottom: '0.1em', marginTop: '0.1em' },
    h2: { fontSize: '1.2em', margin: 0, marginBottom: '0.1em', marginTop: '0.1em' },
    h3: { fontSize: '1em', margin: 0 },
    h4: { fontSize: '1em', margin: 0 },
    hr: {
      marginTop: '0.1em',
      marginBottom: '0.1em',
      borderBottomWidth: `3px`,
    },
    p: { paddingTop: 1 },
    pre: {
      marginTop: '1em',
      marginBottom: '1em',
      lineHeight: '1.2em',
    },
    'blockquote:last-child, pre:last-child': {
      marginBottom: 4,
    },
  },
};

/**
 * Load `global styles`.
 */
css.global(STYLES.CELL);
css.global(STYLES.MARKDOWN, { prefix: `.${CLASS.MARKDOWN}` });
