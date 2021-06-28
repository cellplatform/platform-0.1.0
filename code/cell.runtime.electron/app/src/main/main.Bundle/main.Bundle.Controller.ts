import { rx, t } from '../common';
import { StatusController } from './main.Bundle.Controller.status';
import { UploadController } from './main.Bundle.Controller.upload';
import { Events } from './main.Bundle.Events';

/**
 * Bundle behavior logic.
 */
export function Controller(args: { bus: t.EventBus<any>; http: t.IHttpClient }) {
  const { http } = args;
  const bus = rx.busAsType<t.BundleEvent>(args.bus);
  const events = Events({ bus });
  const { dispose, dispose$ } = events;

  // Initialise sub-controllers.
  UploadController({ bus, events, http });
  StatusController({ bus, events, http });

  return { dispose, dispose$ };
}
