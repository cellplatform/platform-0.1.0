import { css, constants, color } from '../common';

/**
 * Globally assigned styles for the ProseMirror editor.
 */
const styles = {
  h1: { margin: 0 },
  p: { margin: 0 },
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
    paddingTop: 12,
    paddingBottom: 10,
    borderRadius: 2,
    marginTop: 20,
    marginBottom: 25,
  },
};

/**
 * Insert global styles.
 */
const prefix = `.${constants.CSS_CLASS.EDITOR} .ProseMirror`;
css.global({ [prefix]: { outline: 'none' } });
css.global(styles, { prefix });
