import { ConfigFile, HttpClient, rx, t } from '../main/common';
import { Bundle } from '../main/main.Bundle';
import { Log } from '../main/main.Log';
import { Menu } from '../main/main.Menu';
import { System } from '../main/main.System';
import { SystemServer } from '../main/main.System.server';
import { Window } from '../main/main.Window';

export type IMock = {
  dispose(): Promise<void>;
  bus: t.ElectronMainBus;
  http: t.IHttpClient;
  events: {
    bundle: t.BundleEvents;
  };
};

export const Mock = {
  /**
   * Initialize server and controllers.
   */
  async init() {
    const bus = rx.bus<t.ElectronRuntimeEvent>();
    const server = await Mock.server();
    const { host, paths, http } = server;
    const config = await ConfigFile.read();

    /**
     * Initialize controllers.
     */
    System.Controller({ bus, host, paths, config });
    Bundle.Controller({ bus, http });
    Window.Controller({ bus });
    Log.Controller({ bus });
    Menu.Controller({ bus });

    /**
     * Initialize event APIs
     */
    const events = {
      // system: System.Events({ bus }),
      bundle: Bundle.Events({ bus }),
      // window: Window.Events({ bus }),
      // log: Log.Events({ bus }),
      // menu: Menu.Events({ bus }),
    };

    const mock: IMock = {
      bus,
      http,
      events,
      async dispose() {
        await server.dispose();
      },
    };

    return mock;
  },

  /**
   * Mock server.
   */
  async server() {
    const { instance, paths, port, host } = await SystemServer.start({ silent: true });
    let http: t.IHttpClient | undefined;
    return {
      host,
      port,
      paths,
      get http() {
        return http ?? (http = HttpClient.create(host));
      },
      dispose: () => instance.stop(),
    };
  },
};

// export type IMock = ReturnType<typeof Mock.init>;
