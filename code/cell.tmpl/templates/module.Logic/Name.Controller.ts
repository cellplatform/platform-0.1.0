import { takeUntil } from 'rxjs/operators';
import { t, rx } from '../common';

/**
 * Behavioral event controller.
 */
export function Controller(args: { bus: t.EventBus<any> }) {
  const { dispose, dispose$ } = rx.disposable();
  const bus = rx.busAsType<t.BundleEvent>(args.bus);
  const $ = bus.$.pipe(takeUntil(dispose$));

  return {
    dispose,
    dispose$,
  };
}
