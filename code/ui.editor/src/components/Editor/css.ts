import { css } from '../../common';

/**
 * Globally assigned styles for the ProseMirror editor.
 */
const styles = {
  p: {
    margin: 0,
  },
};

css.global({ '.ProseMirror': { outline: 'none' } });
css.global(styles, { prefix: '.ProseMirror' });
