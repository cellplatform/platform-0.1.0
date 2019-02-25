import { css } from '../../common';

/**
 * Globally assigned styles for the ProseMirror editor.
 */
const styles = {
  p: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
};

css.global({ '.ProseMirror': { outline: 'none' } });
css.global(styles, { prefix: '.ProseMirror' });
