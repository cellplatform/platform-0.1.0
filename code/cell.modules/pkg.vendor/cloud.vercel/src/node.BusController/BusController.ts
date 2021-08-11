import { filter } from 'rxjs/operators';
import { BusEvents, DEFAULT, rx, slug, t } from './common';

/**
 * Event controller.
 */
export function BusController(args: {
  bus: t.EventBus<any>;
  filter?: (e: t.VercelEvent) => boolean;
  version?: number;
}) {
  const { version = DEFAULT.version } = args;
  const bus = rx.busAsType<t.VercelEvent>(args.bus);
  const events = BusEvents({ bus });
  const { dispose, dispose$ } = events;
  const $ = events.$.pipe(filter((e) => args.filter?.(e) ?? true));

  /**
   * Module Info
   */
  rx.payload<t.VercelModuleInfoReqEvent>($, 'vendor.vercel/info:req').subscribe((e) => {
    console.log('e', e);
    const { tx = slug() } = e;

    const info: t.VercelModuleInfo = {
      version,
    };

    bus.fire({
      type: 'vendor.vercel/info:res',
      payload: { tx, info },
    });
  });

  /**
   *
   */
  return { dispose, dispose$ };
}
