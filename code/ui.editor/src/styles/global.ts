import { css, constants, color } from '../common';

/**
 * Globally assigned styles for the ProseMirror editor.
 */
const styles = {
  h1: { margin: 0 },
  p: { margin: 0, lineHeight: '1.5em' },
  hr: {
    border: 'none',
    borderBottom: `solid 5px ${color.format(-0.1)}`,
    marginTop: 30,
    marginBottom: 30,
  },
  pre: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 13,
    color: color.format(-0.8),
    backgroundColor: color.format(-0.03),
    border: `solid 1px ${color.format(-0.05)}`,
    padding: 10,
    paddingTop: 12,
    borderRadius: 2,
    marginTop: 20,
    marginBottom: 25,
  },
  ul: {
    margin: 0,
    padding: 0,
    paddingLeft: 25,
  },
};

/**
 * Insert global styles.
 */
const prefix = `.${constants.CSS_CLASS.EDITOR} .ProseMirror`;
css.global({ [prefix]: { outline: 'none' } });
css.global(styles, { prefix });
