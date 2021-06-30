import { rx, t } from '../../common';
import { Events } from '../Bundle.Events';
import { PutController } from './Controller.put';
import { StatusController } from './Controller.status';
import { UploadController } from './Controller.upload';

/**
 * Bundle behavior logic.
 */
export function Controller(args: { bus: t.EventBus<any>; http: t.IHttpClient }) {
  const { http } = args;
  const bus = rx.busAsType<t.BundleEvent>(args.bus);
  const events = Events({ bus });
  const { dispose, dispose$ } = events;

  // Initialise sub-controllers.
  PutController({ bus, events, http });
  StatusController({ bus, events, http });
  UploadController({ bus, events, http });

  return { dispose, dispose$ };
}
