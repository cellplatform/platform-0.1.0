import { t, time } from '../common';
import * as behavior from './behavior';
import { SIMPLE } from '../_SAMPLE/TREE';

export function init(args: { ctx: t.IAppContext; store: t.IAppStore }) {
  const { ctx, store } = args;
  const event$ = ctx.event$;

  behavior.init(args);

  // console.log('SIMPLE', SIMPLE);

  time.delay(1500, () => {
    // event$.next({ type: 'APP:FINDER/tree', payload: { root: SIMPLE } }); // TEMP 🐷
    ctx.fire({ type: 'APP:FINDER/tree', payload: { root: SIMPLE } });
    // event$.next({ type: 'APP:FINDER/tree/select', payload: { node: 'intro.what' } });
  });
}
