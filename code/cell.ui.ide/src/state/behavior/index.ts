import { t } from '../../common';
import * as reduce from './reduce';
import * as epic from './epic';

/**
 * Initialize behavior controllers.
 */
export function init(args: { ctx: t.IAppContext; store: t.IAppStore }) {
  const { ctx, store } = args;

  reduce.init(args);
  epic.init(args);

  /**
   * Initialize
   */
  store.dispatch({ type: 'APP:IDE/load', payload: { uri: ctx.env.def } }); // TEMP 🐷
}
