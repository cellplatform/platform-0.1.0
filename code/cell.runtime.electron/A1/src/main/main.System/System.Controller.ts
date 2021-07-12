import { t, rx, slug, ENV } from '../common';
import { Events } from './System.Events';
import { RuntimeInfo } from '../main.System.server';
import { DataController } from './System.Controller.data';

/**
 * Behavioral event controller.
 */
export function Controller(args: {
  bus: t.EventBus<any>;
  localhost: string;
  paths: t.ElectronDataPaths;
  config: t.ElectronConfigFile;
}) {
  const { paths, config, localhost } = args;
  const service = toServiceInfo(localhost);

  const bus = rx.busAsType<t.SystemEvent>(args.bus);
  const events = Events({ bus });
  const { dispose, dispose$ } = events;

  DataController({ bus, events, paths });

  const getStatus = (): t.SystemStatus => {
    const runtime = RuntimeInfo({ paths });
    const is = { prod: ENV.isProd, dev: ENV.isDev, mac: ENV.isMac };
    const genesis = config.refs.genesis;
    return { genesis, is, service, runtime };
  };

  /**
   * System Status
   */
  events.status.req$.subscribe(async (e) => {
    const { tx = slug() } = e;
    const status = getStatus();
    bus.fire({
      type: 'runtime.electron/System/status:res',
      payload: { tx, status },
    });
  });

  return { dispose, dispose$ };
}

/**
 * [Helpers]
 */

function toServiceInfo(host: string): t.SystemStatusService {
  const protocol = (host.startsWith('localhost') ? 'http' : 'https') as t.HttpProtocol;
  const port = parseInt(host.split(':')[1], 10);
  const url = `${protocol}://${host}`;
  return { protocol, port, host, url };
}
