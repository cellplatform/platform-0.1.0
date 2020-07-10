import { t } from '../common';
import { bundle, filterFiles } from './AppManifest.bundle';

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
      throw new Error(`The bundle does not contain a manifest file named '${filename}'.`);
    }
    return AppManifest.fromFile(file.data, filename);
  }

  public static filterFiles = filterFiles;

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

  public get version() {
    return this.def.version;
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
    const manifest = this.def;
    return bundle({ ...args, manifest });
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

  const res: t.IAppManifestFile = { name, version: '0.0.0', entry, devPort, window };
  return res;
}
