import { EventBus } from '@platform/types';
import { firstValueFrom, of, timeout } from 'rxjs';
import { catchError, filter, takeUntil } from 'rxjs/operators';

import { rx, slug, t } from '../common';

type Id = string;

/**
 * Event API.
 */
export function BusEvents(args: {
  bus: EventBus<any>;
  runtime: Id;
  filter?: (e: t.RuntimeNodeEvent) => boolean;
}): t.RuntimeNodeEvents {
  const { runtime } = args;
  const { dispose, dispose$ } = rx.disposable();
  const bus = rx.busAsType<t.RuntimeNodeEvent>(args.bus);
  const is = BusEvents.is;

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.base(e)),
    filter((e) => e.payload.runtime === runtime),
    filter((e) => args.filter?.(e) ?? true),
  );

  /**
   * Retrieve status information about the runtime.
   */
  const info: t.RuntimeNodeEvents['info'] = {
    req$: rx.payload<t.RuntimeNodeInfoReqEvent>($, 'cell.runtime.node/info:req'),
    res$: rx.payload<t.RuntimeNodeInfoResEvent>($, 'cell.runtime.node/info:res'),
    async get(options = {}) {
      const { timeout: msecs = 3000 } = options;
      const tx = slug();

      const first = firstValueFrom(
        info.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`Info request timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({
        type: 'cell.runtime.node/info:req',
        payload: { tx, runtime },
      });

      const res = await first;
      return typeof res === 'string' ? { tx, runtime, error: res } : res;
    },
  };

  const process: t.RuntimeNodeEvents['process'] = {
    /**
     * The stages of a processes life.
     */
    lifecycle: {
      $: rx.payload<t.RuntimeNodeProcessLifecycleEvent>($, 'cell.runtime.node/lifecycle'),
      fire(process, stage) {
        bus.fire({
          type: 'cell.runtime.node/lifecycle',
          payload: { runtime, process, stage },
        });
      },
    },

    /**
     * Kills ("stops") a running process.
     */
    kill: {
      req$: rx.payload<t.RuntimeNodeKillReqEvent>($, 'cell.runtime.node/kill:req'),
      res$: rx.payload<t.RuntimeNodeKillResEvent>($, 'cell.runtime.node/kill:res'),
      killed$: rx.payload<t.RuntimeNodeKilledEvent>($, 'cell.runtime.node/killed'),
      async fire(processId, options = {}) {
        const { timeout: msecs = 3000 } = options;
        const tx = slug();

        const first = firstValueFrom(
          process.kill.res$.pipe(
            filter((e) => e.tx === tx),
            timeout(msecs),
            catchError(() => of(`Kill request timed out after ${msecs} msecs`)),
          ),
        );

        bus.fire({
          type: 'cell.runtime.node/kill:req',
          payload: { tx, runtime, process: processId },
        });

        const res = await first;
        return typeof res === 'string' ? { tx, runtime, error: res, elapsed: -1 } : res;
      },
    },
  };

  // Finish up.
  return { runtime, $, is, dispose, dispose$, info, process };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
BusEvents.is = {
  base: matcher('cell.runtime.node/'),
  lifecycle(stage: t.RuntimeRunStage) {
    const END: t.RuntimeRunStage[] = ['completed:ok', 'completed:error', 'killed'];
    const OK: t.RuntimeRunStage[] = ['started', 'completed:ok'];
    return {
      ended: END.includes(stage),
      ok: OK.includes(stage),
    };
  },
};
