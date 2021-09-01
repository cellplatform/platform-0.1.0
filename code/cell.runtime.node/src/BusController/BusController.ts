import { filter, take } from 'rxjs/operators';

import { BusEvents } from '../BusEvents';
import { rx, slug, t, time } from '../common';

type RuntimeInstanceId = string;
type Timestamp = number;
type Ref = {
  process: t.RuntimeNodeProcessInfo;
  startedAt: Timestamp;
  lifecycle: t.RuntimeRunStage;
};

/**
 * Event controller.
 */
export function BusController(args: {
  bus: t.EventBus<any>;
  runtime: RuntimeInstanceId;
  filter?: (e: t.RuntimeNodeEvent) => boolean;
}) {
  const { runtime } = args;
  const bus = rx.busAsType<t.RuntimeNodeEvent>(args.bus);
  const events = BusEvents({ bus, runtime: args.runtime, filter: args.filter });
  const { dispose, dispose$ } = events;

  let refs: Ref[] = [];

  /**
   * Process lifecycle.
   */
  events.process.lifecycle.$.subscribe((e) => {
    const { process } = e;
    if (e.stage === 'started') {
      refs.push({ process, lifecycle: e.stage, startedAt: time.now.timestamp });
    }
    if (events.is.lifecycle(e.stage).ended) {
      refs = refs.filter((ref) => ref.process.tx !== process.tx);
    }
  });

  /**
   * Info.
   */
  events.info.req$.subscribe((e) => {
    const { tx = slug() } = e;

    const toProcess = (ref: Ref): t.RuntimeNodeInfoProcess => {
      const { process: info, startedAt } = ref;
      return { info, startedAt };
    };

    const info: t.RuntimeNodeInfo = {
      processes: refs.map(toProcess),
    };

    bus.fire({
      type: 'cell.runtime.node/info:res',
      payload: { tx, runtime, info },
    });
  });

  /**
   * Kill.
   */
  events.process.kill.req$.subscribe((e) => {
    const { tx } = e;
    events.process.kill.killed$
      .pipe(
        filter((e) => e.tx === tx),
        take(1),
      )
      .subscribe((e) => {
        const { process, elapsed } = e;
        bus.fire({
          type: 'cell.runtime.node/kill:res',
          payload: { tx, runtime, process, elapsed },
        });
      });
  });

  return { dispose, dispose$ };
}
