import '../../../node_modules/graphiql/graphiql.css';
import { css, color, constants, COLORS } from '../../common';

const ROOT = constants.CSS.ROOT;

const styles = {
  '.topBar': {
    background: COLORS.DARK,
    padding: 10,
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

  '.execute-button-wrap': {
    marginLeft: 0,
  },

  '.execute-button-wrap button': {
    boxShadow: 'none',
  },
};

const prefix = `.${ROOT} .graphiql-container`;
css.global(styles, { prefix });
