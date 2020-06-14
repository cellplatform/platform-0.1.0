import { t, time, Client, Schema } from '../../common';

export type IAppManifest = {
  name: string;
  entry: string;
  devPort: number;
  window: {
    width?: number;
    height?: number;
  };
};

export async function uploadApp(args: {
  ctx: t.ISysContext;
  dir: string;
  files: t.IHttpClientCellFileUpload[];
}) {
  const { ctx, dir, files = [] } = args;
  const { client } = ctx;

  if (!dir) {
    throw new Error(`A directory bundle was not dropped.`);
  }

  const manifestFile = files.find((file) => file.filename === 'app.json');
  if (!manifestFile) {
    throw new Error(`The bundle does not contain an 'app.json' manifest.`);
  }

  const manifest = toManifest(manifestFile);
  console.log('manifest', manifest);

  console.group('🌳 ');
  console.log('client', client);
  console.log('client.host', client.http.origin);

  // const save = client.
  // const saver = Client.saveMonitor({ client, debounce: 10 });
  // saver.event$.subscribe((e) => {
  //   console.log('e save ::', e);
  // });

  // client.changes.watch(sheet)
  // client.changes.changed$.subscribe((e) => {
  //   console.log('e', e);
  // });

  const sheet = await client.sheet<t.App>('ns:sys.app');
  const apps = await sheet.data('App').load();

  // client.changes.watch(sheet);
  console.log('apps', apps);
  console.log('apps.total', apps.total);

  const exists = Boolean(apps.find((row) => row.name === manifest.name));
  if (exists) {
    throw new Error(`The app bundle '${dir}' already exists.`);
  }

  // Create type model.
  const app = apps.row(apps.total);
  const props = app.props;
  props.name = manifest.name;
  props.entry = manifest.entry;
  props.devPort = manifest.devPort || props.devPort;
  props.width = manifest.window.width || props.width;
  props.height = manifest.window.height || props.height;

  // apps.rows.forEach((app) => {
  //   // const o = app.toObject();
  //   // console.log('o', o);
  // });

  // files.forEach((file) => {
  //   console.log('file', file);
  // });

  // const env = window.env

  await time.wait(50);
  console.log('sheet.state.changes', sheet.state.changes);
  const changes = sheet.state.changes;

  // const f = ctx.c
  // console.log('client.cache.keys', client.cache.keys);
  // console.group('🌳 cache');
  // client.cache.keys.forEach((key) => {
  //   const v = client.cache.get(key);

  //   console.log('cache key:', key);
  // });

  // console.groupEnd();

  // client.cache.keys.forEach((key) => {
  //   if (key.includes('client/')) {
  //     console.group('🌳 cache (client)');
  //     const v = client.cache.get(key);
  //     console.log('cache key:', key);
  //     console.log('value', v);
  //     console.groupEnd();
  //   }
  // });

  // ctx.

  // console.log('ctx', ctx);

  const e: t.IpcSheetChangedEvent = {
    type: 'IPC/sheet/changed',
    payload: {
      source: ctx.def,
      ns: sheet.uri.id,
      changes,
    },
  };

  ctx.fire(e as any);

  // await app.load({ force: true });

  console.groupEnd();

  // sheet.
}

/**
 * [Helpers]
 */

function toJson<T>(filename: string, data: ArrayBuffer) {
  try {
    const decoder = new TextDecoder('utf8');
    return JSON.parse(decoder.decode(data)) as T;
  } catch (error) {
    throw new Error(`Failed to parse JSON in '${filename}'.`);
  }
}

function toManifest(file: t.IHttpClientCellFileUpload) {
  const { filename, data } = file;
  const obj = toJson<IAppManifest>(filename, data);
  if (typeof obj !== 'object') {
    throw new Error(`The manifest '${filename}' is not an object.`);
  }

  const { entry = 'bundle/index.html', devPort = 1234, window = {} } = obj;
  const name = (obj.name || '').trim();
  if (!name) {
    throw new Error(`The manifest '${filename}' does not contain a name.`);
  }

  const res: IAppManifest = { name, entry, devPort, window };
  return res;
}
