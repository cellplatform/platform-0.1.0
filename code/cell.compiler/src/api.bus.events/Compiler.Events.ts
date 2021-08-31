import { takeUntil, filter } from 'rxjs/operators';
import { t, rx } from './common';
import { EventBus } from '@platform/types';

/**
 * Event API.
 */
export function CompilerEvents(args: { bus: EventBus<any> }) {
  const { dispose, dispose$ } = rx.disposable();
  const bus = rx.busAsType<t.CompilerEvent>(args.bus);
  const is = CompilerEvents.is;

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.base(e)),
  );

  return { $, is, dispose, dispose$ };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
CompilerEvents.is = {
  base: matcher('cell.compiler/'),
};
