import { t } from '../../common';
import * as reduce from './reduce';
import * as epic from './epic';

const TEMP_DATA_URI = 'cell:ckcmyowv5000e456cayhy1omy:1';

/**
 * Initialize behavior controllers.
 */
export function init(args: { ctx: t.IAppContext; store: t.IAppStore }) {
  const { store } = args;

  reduce.init(args);
  epic.init(args);

  /**
   * Initialize
   */
  store.dispatch({
    type: 'APP:IDE/load',
    payload: { uri: TEMP_DATA_URI }, // TEMP 🐷
  });
}
