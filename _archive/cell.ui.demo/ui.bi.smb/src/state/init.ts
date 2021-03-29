import { t, time } from '../common';
import * as behavior from './behavior';
import { SIMPLE } from '../_SAMPLE/TREE';

export function init(args: { ctx: t.IAppContext; store: t.IAppStore }) {
  const { ctx } = args;

  behavior.init(args);

  time.delay(0, () => {
    // event$.next({ type: 'APP:FINDER/tree', payload: { root: SIMPLE } }); // TEMP 🐷
    ctx.fire({ type: 'APP:FINDER/tree', payload: { root: SIMPLE } });
    ctx.fire({ type: 'APP:FINDER/tree/select', payload: { node: 'intro' } });
  });
}
