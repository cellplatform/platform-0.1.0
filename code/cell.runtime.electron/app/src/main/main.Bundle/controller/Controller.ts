import { Events } from '../Bundle.Events';
import { rx, t } from '../common';
import { InstallController } from './Controller.install';
import { ListController } from './Controller.list';
import { StatusController } from './Controller.status';
import { FilesystemController } from './Controller.fs';

/**
 * Bundle behavior logic.
 */
export function Controller(args: { bus: t.EventBus<any>; http: t.IHttpClient }) {
  const { http } = args;
  const bus = rx.busAsType<t.BundleEvent>(args.bus);
  const events = Events({ bus });
  const { dispose, dispose$ } = events;

  // Initialise sub-controllers.
  InstallController({ bus, events, http });
  ListController({ bus, events, http });
  StatusController({ bus, events, http });
  FilesystemController({ bus, events, http });

  // Finish up.
  return { dispose, dispose$ };
}
