import { time, ConfigFile, HttpClient, rx, t, fs, Paths, Genesis, slug } from '../main/common';
import { Bundle } from '../main/main.Bundle';
import { Log } from '../main/main.Log';
import { Menu } from '../main/main.Menu';
import { System } from '../main/main.System';
import { SystemServer } from '../main/main.System.server';
import { Window } from '../main/main.Window';
import { ModuleRegistry } from '../data.http';

export type IMockServer = {
  host: string;
  port: number;
  paths: t.ElectronDataPaths;
  http: t.IHttpClient;
  dispose(): Promise<void>;
};

export type IMockControllers = {
  bus: t.ElectronMainBus;
  http: t.IHttpClient;
  paths: t.ElectronDataPaths;
  events: { bundle: t.BundleEvents };
  dispose(): Promise<void>;
};

export const Mock = {
  /**
   * Initialize server and controllers.
   */
  async controllers() {
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

    const mock: IMockControllers = {
      bus,
      http,
      events,
      paths,
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
    const { instance, paths, port, host } = await SystemServer.start({
      prod: false,
      silent: true,
      paths: Mock.paths(),
    });
    let http: t.IHttpClient | undefined;
    const mock: IMockServer = {
      host,
      port,
      paths,
      get http() {
        return http ?? (http = HttpClient.create(host));
      },
      async dispose() {
        await instance.stop();
        time.delay(100, () => fs.remove(paths.dir)); // NB: Delay before deleting to prevent the DB's own delayed clean process from failing.
      },
    };
    return mock;
  },

  /**
   * Generate mock paths
   */
  paths(): Partial<t.ElectronDataPaths> | undefined {
    const dir = fs.join(Paths.tmp, 'data.test', slug());
    return {
      dir,
      db: fs.join(dir, 'local.db'),
      fs: fs.join(dir, 'local.fs'),
      config: fs.join(dir, 'local.config'),
    };
  },

  /**
   * Delete test data.
   */
  async delete() {
    await fs.remove(fs.join(Paths.tmp, 'data.test'));
  },

  /**
   * Helpers for working with a [ModuleRegistry].
   */
  Registry: {
    async get(http: t.IHttpClient) {
      const genesis = Genesis(http);
      return ModuleRegistry({ http, uri: await genesis.modules.uri() });
    },

    async clear(http: t.IHttpClient) {
      const registry = await Mock.Registry.get(http);
      await registry.delete();
    },
  },
};
