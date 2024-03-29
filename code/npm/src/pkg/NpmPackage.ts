import { R, fs, value, parseVersionPrefix } from '../common';
import * as t from './types';
import { getVersions } from '../get';

export type INpmPackageInit = {
  dir?: string;
  json?: t.NpmPackageJson;
};

/**
 * Represents a `package.json`.
 */
export class NpmPackage {
  /**
   * [Static]
   */
  public static create = (input?: string | INpmPackageInit) =>
    typeof input === 'string' || input === undefined
      ? new NpmPackage({ dir: input })
      : new NpmPackage(input);

  /**
   * [Lifecycle]
   */
  private constructor(args: INpmPackageInit) {
    let dir = args.dir;
    dir = dir ? dir : '.';
    dir = dir.trim();

    let path = dir.endsWith('package.json') ? dir : fs.join(dir, 'package.json');
    path = args.json ? path : fs.resolve(path);
    this.path = path;
    this.exists = fs.existsSync(this.path);

    const loadFile = () => {
      return this.exists ? fs.file.loadAndParseSync<t.NpmPackageJson>(this.path, {}) : {};
    };
    this.json = args.json ? args.json : loadFile();
    this._original = { ...this.json };
  }

  /**
   * [Fields]
   */
  public readonly path: string;
  public readonly exists: boolean;

  public json: t.NpmPackageJson;
  private readonly _original: t.NpmPackageJson;

  /**
   * [Properties]
   */
  public get dir() {
    const dir = fs.dirname(this.path);
    return dir === '.' ? '' : dir;
  }
  public get name() {
    return this.json.name;
  }
  public get description() {
    return this.json.description;
  }
  public get version() {
    return this.json.version;
  }
  public get main() {
    return this.json.main;
  }
  public get scripts() {
    return this.json.scripts || {};
  }
  public get dependencies() {
    return this.json.dependencies || {};
  }
  public get devDependencies() {
    return this.json.devDependencies || {};
  }
  public get peerDependencies() {
    return this.json.peerDependencies || {};
  }
  public get resolutions() {
    return this.json.resolutions || {};
  }

  /**
   * Determine if the JSON state has been modified since creation.
   */
  public get isChanged() {
    return !R.equals(this.json, this._original);
  }

  /**
   * [METHODS]
   */

  /**
   * Saves changes to the `package.json` file.
   */
  public async save(path?: string) {
    path = formatSavePath(path);
    await fs.file.stringifyAndSave(path || this.path, this.json);
    return this;
  }

  /**
   * Saves changes to the `package.json` file.
   */
  public async saveSync(path?: string) {
    path = formatSavePath(path);
    fs.file.stringifyAndSaveSync(path || this.path, this.json);
    return this;
  }

  /**
   * Adds fields to the specified field-set.
   */
  public setFields(
    key: t.NpmPackageFieldsKey,
    fields: t.INpmPackageFields,
    options: { force?: boolean } = {},
  ) {
    const { force } = options;
    const json = { ...this.json };
    const target = (this.json[key] || {}) as t.INpmPackageFields;
    json[key] = NpmPackage.setFields(fields, target, { force });
    this.json = json;
    return this;
  }

  /**
   * Removes fields from the specified field-set.
   */
  public removeFields(
    key: t.NpmPackageFieldsKey,
    fields: t.INpmPackageFields | string[],
    options: {
      force?: boolean;
      exclude?: string | string[];
    } = {},
  ) {
    const { force, exclude } = options;
    const json = { ...this.json };
    const target = (this.json[key] || {}) as t.INpmPackageFields;
    json[key] = NpmPackage.removeFields(fields, target, { force, exclude });
    this.json = json;
    return this;
  }

  /**
   * Retrieves the latest versions of dependencies.
   */
  public async updateVersions(
    args: {
      types?: t.NpmDepenciesFieldKey[];
      filter?: (name: string, version: string) => boolean;
      updateState?: boolean;
    } = {},
  ) {
    const updateState = value.defaultValue(args.updateState, true);
    const types = args.types || ['dependencies', 'devDependencies', 'peerDependencies'];

    type VersionChange = {
      type: t.NpmDepenciesFieldKey;
      name: string;
      from: string;
      to: string;
    };
    type VersionUpdateResult = {
      isChanged: boolean;
      total: number;
      types: t.NpmDepenciesFieldKey[];
      changed: VersionChange[];
      unchanged: VersionChange[];
    };

    let result: VersionUpdateResult = {
      total: 0,
      isChanged: false,
      types,
      changed: [],
      unchanged: [],
    };

    const getLatest = async (type: t.NpmDepenciesFieldKey, fields?: t.INpmPackageFields) => {
      if (!fields) {
        return;
      }
      let isChanged = false;
      const latest = await NpmPackage.getLatestVersions(fields, args.filter);
      Object.keys(latest).forEach((name) => {
        const from = fields[name];
        const to = latest[name];
        const changed = from !== to;
        const version: VersionChange = { type, name, from, to };
        if (changed) {
          result.changed = [...result.changed, version];
          isChanged = true;
        }
        if (!changed) {
          result.unchanged = [...result.unchanged, version];
        }
      });

      if (updateState && isChanged) {
        this.setFields(type, latest, { force: true });
      }
    };

    // Calculate the latest versions.
    const wait = types.map((type) => getLatest(type, this[type]));
    await Promise.all(wait);

    // Finish up.
    result = {
      ...result,
      isChanged: this.isChanged,
      total: result.changed.length,
    };
    return result;
  }

  /**
   * Stringifies the [package.json] file as JSON.
   */
  public toJson() {
    const json = JSON.stringify(this.json, null, '  ');
    return `${json}\n`;
  }

  /**
   * [STATIC]
   */

  /**
   * Adds a set of fields to a target object.
   */
  public static setFields(
    source: t.INpmPackageFields,
    target: t.INpmPackageFields,
    options: { force?: boolean } = {},
  ) {
    const { force = false } = options;
    target = { ...target };
    Object.keys(source).forEach((key) => {
      const value = (source[key] || '').trim();
      if (value && (force || !target[key])) {
        target[key] = value;
      }
    });
    return target;
  }

  /**
   * Removes a set of fields from a target object.
   */
  public static removeFields(
    source: t.INpmPackageFields | string[],
    target: t.INpmPackageFields,
    options: { force?: boolean; exclude?: string | string[] } = {},
  ) {
    const {
      force = Array.isArray(source), // NB: Always force remove when an array of keys are passed (no values to compare with).
    } = options;

    const keys = Array.isArray(source) ? source : Object.keys(source);
    const exclude = options.exclude
      ? Array.isArray(options.exclude)
        ? options.exclude
        : [options.exclude]
      : [];

    const trim = (value?: string) => (value || '').trim();

    keys
      .filter((key) => !exclude.includes(key))
      .forEach((key) => {
        const sourceValue = source[key];
        const targetValue = target[key];
        if (force || trim(sourceValue) === trim(targetValue)) {
          delete target[key];
        }
      });
    return target;
  }

  /**
   * Finds the latest versions for the given set of fields
   */
  public static async getLatestVersions(
    fields: t.INpmPackageFields,
    filter?: (name: string, version: string) => boolean,
  ) {
    // Setup initial conditions.
    const original = { ...fields };
    fields = { ...fields };

    // Filter down on specific fields if required.
    if (filter) {
      Object.keys(fields)
        .filter((name) => {
          const { version } = parseVersionPrefix(fields[name]);
          return !filter(name, version);
        })
        .forEach((name, version) => {
          delete fields[name];
        });
    }

    // Retrieve the latest versions.
    fields = await getVersions(fields);

    // Re-insert any prefixes.
    Object.keys(fields).forEach((name) => {
      const { prefix } = parseVersionPrefix(original[name]);
      if (prefix) fields[name] = `${prefix}${fields[name]}`;
    });

    // Finish up.
    return { ...original, ...fields };
  }
}

/**
 * INTERNAL
 */
function formatSavePath(path?: string) {
  if (!path) {
    return undefined;
  }
  return path.endsWith('.json') ? path : fs.join(path, 'package.json');
}
