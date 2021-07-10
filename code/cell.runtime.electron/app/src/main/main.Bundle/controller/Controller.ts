import { Events } from '../Bundle.Events';
import { rx, t, HttpClient } from '../common';
import { InstallController } from './Controller.install';
import { ListController } from './Controller.list';
import { StatusController } from './Controller.status';
import { FilesystemController } from './Controller.fs';

/**
 * Bundle behavior logic.
 */
export function Controller(args: {
  bus: t.EventBus<any>;
  localhost: string;
  httpFactory: (host: string) => t.IHttpClient;
}) {
  const { httpFactory, localhost } = args;
  const bus = rx.busAsType<t.BundleEvent>(args.bus);
  const events = Events({ bus });
  const { dispose, dispose$ } = events;

  // Initialise sub-controllers.
  InstallController({ bus, events, localhost, httpFactory });
  ListController({ bus, events, localhost, httpFactory });
  StatusController({ bus, events, localhost, httpFactory });
  FilesystemController({ bus, events, localhost, httpFactory });

  // Finish up.
  return { dispose, dispose$ };
}
