/**
 * - https://codemirror.net/theme
 *
 * NOTE:
 *    Ensure that you import the base css files from witin the consuming module.
 *    eg:
 *
 *        import `@platform/ui.graphql/css/index.css`
 *
 */
import { css, color, constants, COLORS } from './common';

const CLI = COLORS.CLI;
const ROOT = constants.CSS.ROOT;
const DARK = color.create(COLORS.DARK);

const styles = {
  /**
   * Shell structure.
   */
  '.topBar': {
    padding: 10,
    background: COLORS.DARK,
    color: COLORS.WHITE,
    border: 'none',
  },
  '.toolbar-button': {
    background: 'none',
    border: `solid 1px ${color.format(0.1)}`,
    boxShadow: 'none',
    color: color.format(0.7),
    fontSize: 13,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 15,
    paddingRight: 15,
  },

  '.docExplorerShow': {
    background: COLORS.DARK,
    color: COLORS.WHITE,
    border: 'none',
  },

  '.variable-editor-title': {
    background: COLORS.DARK,
    color: COLORS.WHITE,
    border: 'none',
  },

  '.execute-button-wrap': {
    marginLeft: 0,
  },

  '.execute-button-wrap button': {
    boxShadow: 'none',
  },

  '.resultWrap': {
    borderLeft: 'none',
  },

  /**
   * Code editor.
   */

  '.CodeMirror-gutter.CodeMirror-foldgutter': {
    background: COLORS.DARK,
  },

  '.CodeMirror-gutter.CodeMirror-linenumbers': {
    background: DARK.lighten(8).toRgbString(),
  },

  '.CodeMirror.cm-s-nord': {
    background: DARK.darken(15).toRgbString(),
  },

  '.CodeMirror-linenumber': { color: color.format(0.4) },

  /**
   * Syntax highlighting
   */
  '.cm-invalidchar': {
    color: CLI.MAGENTA,
  },

  '.cm-keyword': { color: CLI.MAGENTA },
  '.cm-property': { color: CLI.CYAN },
  '.cm-def': { color: CLI.WHITE },
  '.cm-attribute': { color: CLI.LIME },
  '.cm-number': { color: CLI.BLUE },
  '.cm-string': { color: CLI.YELLOW },
  '.cm-string-2': { color: CLI.YELLOW },
};

const prefix = `.${ROOT} .graphiql-container`;
css.global(styles, { prefix });
