import { t, Uri, time, defaultValue } from '../common';

const MANIFEST_FILENAME = 'app.json';

/**
 * An application manifest
 */
export class AppManifest {
  public static fromFile(data: ArrayBuffer, filename: string = MANIFEST_FILENAME) {
    const def = toManifest(filename, data);
    return AppManifest.create(def);
  }

  public static fromFiles(
    files: t.IHttpClientCellFileUpload[],
    filename: string = MANIFEST_FILENAME,
  ) {
    const file = files.find((file) => file.filename === filename);
    if (!file) {
      throw new Error(`The bundle does not contain an '${filename}' manifest file.`);
    }
    return AppManifest.fromFile(file.data, filename);
  }

  public static filterFiles(files: t.IHttpClientCellFileUpload[] = []) {
    return files
      .filter((file) => !file.filename.endsWith('.DS_Store'))
      .filter((file) => !file.filename.endsWith('.map'))
      .filter((file) => file.data.byteLength > 0);
  }

  /**
   * [Lifecycle]
   */
  public static create = (def: t.IAppManifestFile) => new AppManifest({ def });
  private constructor(args: { def: t.IAppManifestFile }) {
    this.def = args.def;
  }

  /**
   * [Fields]
   */
  public readonly def: t.IAppManifestFile;

  /**
   * [Properties]
   */
  public get name() {
    return this.def.name;
  }

  /**
   * [Methods]
   */
  public async bundle(args: {
    client: t.IClientTypesystem;
    ns: t.INsUri | string; // Namespace of {App} sheet.
    dir: string;
    files: t.IHttpClientCellFileUpload[];
  }) {
    const ns = Uri.toNs(args.ns);
    const { client, dir } = args;
    const files = AppManifest.filterFiles(args.files);

    const manifest = this.def;
    const sheet = await client.sheet<t.AppTypeIndex>(ns);
    const apps = await sheet.data('App').load();

    const exists = Boolean(apps.find((row) => row.name === manifest.name));
    const bytes = files.reduce((acc, next) => acc + next.data.byteLength, 0);

    console.log('apps', apps);
    apps.forEach((app) => {
      console.log('app.name', app.name);
    });

    const api = {
      manifest,
      ns,
      dir,
      files,
      bytes,
      exists,

      /**
       * Save the app bundle model, and optionally upload the files.
       * NOTE:
       *    The upload operation may be deferred here to allow another step
       *    in the process to sync data before sending files to the server.
       *    If this is the case, pass {upload:false} then explicially call
       *
       *        bundle.upload(app)
       *
       *    passing the {app} row model returned from `save`.
       *
       */
      async save(options: { upload?: boolean } = {}) {
        if (exists) {
          throw new Error(`The app '${manifest.name}' has already been installed.`);
        }
        const { changes, app } = await writeTypeDef({ sheet, apps, manifest, bytes });
        if (defaultValue(options.upload, true)) {
          await this.upload(app);
        }
        return { changes, app };
      },

      /**
       * Uploads files to the row.
       */
      async upload(app: t.AppRow) {
        const entry = app.props.entry;
        const dir = entry.substring(0, entry.indexOf('/'));
        const files = args.files.map((file) => ({ ...file, filename: `${dir}/${file.filename}` }));

        const target = app.types.map.fs.uri;
        const res = await client.http.cell(target).files.upload(files);

        if (res.error) {
          throw new Error(`Failed to upload files. ${res.error.message}`);
        }
      },
    };

    return api;
  }
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

function toManifest(filename: string, data: ArrayBuffer) {
  const obj = toJson<t.IAppManifestFile>(filename, data);
  if (typeof obj !== 'object') {
    throw new Error(`The manifest '${filename}' is not an object.`);
  }

  const { entry = 'bundle/index.html', devPort = 1234, window = {} } = obj;
  const name = (obj.name || '').trim();
  if (!name) {
    throw new Error(`The manifest '${filename}' does not contain a name.`);
  }

  const res: t.IAppManifestFile = { name, entry, devPort, window };
  return res;
}

async function writeTypeDef(args: {
  sheet: t.ITypedSheet<t.AppTypeIndex>;
  apps: t.AppCursor;
  manifest: t.IAppManifestFile;
  bytes: number;
}) {
  const { sheet, apps, manifest } = args;

  const app = apps.row(apps.total);
  const props = app.props;

  props.name = manifest.name;
  props.entry = manifest.entry;
  props.devPort = manifest.devPort || props.devPort;
  props.width = manifest.window.width || props.width;
  props.height = manifest.window.height || props.height;
  props.minWidth = manifest.window.minWidth || props.minWidth;
  props.minHeight = manifest.window.minHeight || props.minHeight;
  props.bytes = args.bytes;

  await time.wait(10); // NB: Allow time for prop changes to be reflected in the sheet state.
  const changes = sheet.changes;

  return { app, changes };
}
