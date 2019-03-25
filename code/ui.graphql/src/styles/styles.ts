import '../../node_modules/graphiql/graphiql.css';
import './nord.css';
import { css, color, constants, COLORS } from '../common';

const CLI = COLORS.CLI;
const ROOT = constants.CSS.ROOT;
const DARK = color.create(COLORS.DARK);

const styles = {
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

  '.execute-button-wrap': {
    marginLeft: 0,
  },

  '.execute-button-wrap button': {
    boxShadow: 'none',
  },

  '.CodeMirror-gutter.CodeMirror-foldgutter': {
    background: COLORS.DARK,
  },

  '.CodeMirror-gutter.CodeMirror-linenumbers': {
    background: DARK.lighten(5).toRgbString(),
    // background: DARK.darken(10).toRgbString(),
  },

  '.CodeMirror.cm-s-nord': {
    background: DARK.darken(12).toRgbString(),
  },

  '.resultWrap': {
    borderLeft: 'none',
  },

  '.cm-invalidchar': {
    color: CLI.MAGENTA,
  },
};

const prefix = `.${ROOT} .graphiql-container`;
css.global(styles, { prefix });
