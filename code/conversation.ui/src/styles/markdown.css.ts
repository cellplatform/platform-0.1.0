import { CSS, css } from '../common';

const styles = {
  // '*:first-child': { marginTop: 0 },
  // '*:last-child': { marginBottom: 0 },
};

/**
 * Insert global styles.
 */
css.global(styles, { prefix: `.${CSS.CLASS.MARKDOWN}` });
