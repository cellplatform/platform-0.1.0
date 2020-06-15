import { t, time } from '../../common';

export type IAppManifest = {
  name: string;
  entry: string;
  devPort: number;
  window: {
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
  };
};

export async function getApps(client: t.IClientTypesystem) {
  const sheet = await client.sheet<t.App>('ns:sys.app');
  const apps = await sheet.data('App').load();
  return { sheet, apps };
}

export function getManifest(files: t.IHttpClientCellFileUpload[]) {
  const file = files.find((file) => file.filename === 'app.json');
  return file ? toManifest(file) : undefined;
}

export async function uploadApp(args: {
  ctx: t.IAppContext;
  dir: string;
  files: t.IHttpClientCellFileUpload[];
}) {
  const { ctx, dir, files = [] } = args;
  const { client } = ctx;

  if (!dir) {
    throw new Error(`The dropped item was not a folder.`);
  }

  // const manifestFile = files.find((file) => file.filename === 'app.json');
  const manifest = getManifest(files);
  if (!manifest) {
    throw new Error(`The bundle does not contain an 'app.json' manifest.`);
  }

  console.group('🌳 ');

  // const save = client.
  // const saver = Client.saveMonitor({ client, debounce: 10 });
  // saver.event$.subscribe((e) => {
  //   console.log('e save ::', e);
  // });

  // client.changes.watch(sheet)
  // client.changes.changed$.subscribe((e) => {
  //   console.log('e', e);
  // });

  const { sheet, apps } = await getApps(client);

  // const sheet = await client.sheet<t.App>('ns:sys.app');
  // const apps = await sheet.data('App').load();

  // client.changes.watch(sheet);
  console.log('apps', apps);
  console.log('apps.total', apps.total);

  // console.log('files', files);

  const exists = Boolean(apps.find((row) => row.name === manifest.name));
  if (exists) {
    throw new Error(`The app '${manifest.name}' has already been installed.`);
  }

  // Create type model.
  // Send change back to MAIN (to be saved).
  const totalBytes = files.reduce((acc, next) => acc + next.data.byteLength, 0);
  const { app, changes } = await writeTypeDefModel({ sheet, apps, manifest, totalBytes });
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
  // const app = apps.row(apps.total);

  // Upload files.
  await upload({ client, files, app });

  console.groupEnd();

  // sheet.
}

/**
 * [Helpers]
 */

async function writeTypeDefModel(args: {
  sheet: t.ITypedSheet<t.App>;
  apps: t.ITypedSheetData<t.App>;
  manifest: IAppManifest;
  totalBytes: number;
}) {
  const { sheet, apps, manifest } = args;

  console.log('-------------------------------------------');

  const app = apps.row(apps.total);
  const props = app.props;

  props.name = manifest.name;
  props.entry = manifest.entry;
  props.devPort = manifest.devPort || props.devPort;
  props.width = manifest.window.width || props.width;
  props.height = manifest.window.height || props.height;
  props.minWidth = manifest.window.minWidth || props.minWidth;
  props.minHeight = manifest.window.minHeight || props.minHeight;
  props.bytes = args.totalBytes;

  await time.wait(50);
  const changes = sheet.state.changes;

  console.group('🌳 WRITE MODEL');
  console.log('changes', changes);
  console.log('apps.total', apps.total);
  apps.rows.forEach((row) => console.log('row.toObject()', row.props.name, row.toString()));

  console.log('eq', apps.rows[0] === apps.rows[1]);

  console.log('sheet.state', sheet.state);

  console.groupEnd();

  return { app, changes };
}

async function upload(args: {
  client: t.IClientTypesystem;
  files: t.IHttpClientCellFileUpload[];
  app: t.ITypedSheetRow<t.App>;
}) {
  const { client, app } = args;
  const entry = app.props.entry;
  const dir = entry.substring(0, entry.indexOf('/'));
  const files = args.files.map((file) => ({ ...file, filename: `${dir}/${file.filename}` }));

  const target = app.types.map.fs.uri;
  const res = await client.http.cell(target).files.upload(files);

  if (res.error) {
    throw new Error(`Failed to upload files. ${res.error.message}`);
  }
}

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
