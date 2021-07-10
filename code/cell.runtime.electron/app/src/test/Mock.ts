import {
  time,
  ConfigFile,
  HttpClient,
  rx,
  t,
  fs,
  Paths,
  Genesis,
  slug,
  Urls,
} from '../main/common';
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
  http: t.IHttpClient;
  urls: t.IUrls;
  paths: t.ElectronDataPaths;
  dispose(): Promise<void>;
};

export type IMockControllers = {
  bus: t.ElectronMainBus;
  http: t.IHttpClient;
  urls: t.IUrls;
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
    const { paths, http, urls } = server;
    const config = await ConfigFile.read();

    const localhost = server.host;
    const httpFactory = (host: string) => HttpClient.create(host);

    /**
     * Initialize controllers.
     */
    System.Controller({ bus, localhost, paths, config });
    Bundle.Controller({ bus, localhost, httpFactory });
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

    const dispose = async () => {
      await server.dispose();
    };

    const mock: IMockControllers = { bus, http, events, paths, urls, dispose };
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

    const http = HttpClient.create(host);
    const urls = Urls.create(host);

    const dispose = async () => {
      await instance.stop();
      time.delay(100, () => fs.remove(paths.dir)); // NB: Delay before deleting to prevent the DB's own delayed clean process from failing.
    };

    const mock: IMockServer = { host, port, paths, http, urls, dispose };
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
