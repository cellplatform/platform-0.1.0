import { t, rx, slug, ENV, ConfigFile } from '../common';
import { Events } from './main.System.Events';
import { RuntimeInfo } from '../main.server';

type Protocol = t.SystemStatusService['protocol'];

/**
 * Behavioral event controller.
 */
export function Controller(args: {
  bus: t.EventBus<any>;
  paths: t.ElectronDataPaths;
  host: string;
}) {
  const { paths, host } = args;
  const protocol = (host.startsWith('localhost') ? 'http' : 'https') as Protocol;
  const service: t.SystemStatusService = { protocol, host, endpoint: `${protocol}://${host}` };

  const bus = rx.busAsType<t.SystemEvent>(args.bus);
  const events = Events({ bus });
  const { dispose, dispose$ } = events;

  /**
   * Status.
   */
  events.status.req$.subscribe(async (e) => {
    const { tx = slug() } = e;
    const runtime = RuntimeInfo({ paths });
    const is = { prod: ENV.isProd, dev: ENV.isDev, mac: ENV.isMac };
    const status: t.SystemStatus = { service, is, runtime, paths };
    bus.fire({
      type: 'runtime.electron/sys/status:res',
      payload: { tx, status },
    });
  });

  return {
    dispose,
    dispose$,
  };
}
