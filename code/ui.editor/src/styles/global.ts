import { css, constants } from '../common';

/**
 * Globally assigned styles for the ProseMirror editor.
 */
const styles = {
  h1: { margin: 0 },
  p: { margin: 0 },
};

/**
 * Insert global styles.
 */
const prefix = `.${constants.CSS_CLASS.EDITOR} .ProseMirror`;
css.global({ [prefix]: { outline: 'none' } });
css.global(styles, { prefix });
