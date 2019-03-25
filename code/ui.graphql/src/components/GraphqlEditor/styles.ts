import '../../../node_modules/graphiql/graphiql.css';
import { css, constants, COLORS } from '../../common';

const ROOT = constants.CSS.ROOT;

const styles = {
  '.topBar': {
    background: COLORS.DARK,
  },
};

const prefix = `.${ROOT} .graphiql-container`;
css.global(styles, { prefix });
