import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';
import { util, fs, t, defaultValue } from '../common';

/**
 * A DB that writes to the file-system.
 */
export class FileDb {
  /**
   * [Static]
   */
  public static DELETED_SUFFIX = '._deleted';
  public static ensureTimestamps = util.ensureTimestamps;
  public static incrementTimestamps = util.incrementTimestamps;

  /**
   * [Lifecycle]
   */
  constructor(args: { dir: string; cache?: boolean }) {
    this.dir = args.dir;
    this.cache.isEnabled = Boolean(args.cache);
  }

  /**
   * [Fields]
   */
  public readonly dir: string;

  public readonly cache: t.IFileDbCache = {
    isEnabled: false,
    values: {},
    exists: (key: string) => this.cache.values[key] !== undefined,
    clear: (keys?: string[]) => {
      const remove = (key: string) => {
        if (this.cache.exists(key)) {
          delete this.cache.values[key];
          this.fire({ type: 'DB/cache/removed', payload: { key, dir: this.dir } });
        }
      };
      (keys || Object.keys(this.cache.values)).forEach(remove);
    },
  };

  private readonly _events$ = new Subject<t.FileDbEvent>();
  public readonly events$ = this._events$.pipe(share());

  private readonly _dispose$ = new Subject<{}>();
  public readonly dispose$ = this._dispose$.pipe(share());

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  public toString() {
    return `[DB:${this.dir}]`;
  }

  /**
   * [Get]
   */
  public async get(key: string): Promise<t.IFileDbValue> {
    const cachedValue = this.cache.isEnabled ? this.cache.values[key] : undefined;

    const fire = (result: t.IFileDbValue, cached: boolean) => {
      const { value, props } = result;
      this.fire({
        type: 'DB/get',
        payload: { action: 'get', key, value, props, cached },
      });
    };

    // Return value from cache.
    if (this.cache.isEnabled && cachedValue !== undefined) {
      fire(cachedValue, true);
      return cachedValue;
    }

    // Read value from file-system.
    const res = await FileDb.get(this.dir, key.toString());
    fire(res, false);

    // Store value in cache (if required).
    if (this.cache.isEnabled) {
      this.cache.values[key] = res;
    }

    // Finish up.
    return res;
  }
  public static async get(dir: string, key: string): Promise<t.IFileDbValue> {
    const path = FileDb.toPath(dir, key);
    const exists = await fs.pathExists(path);
    const props: t.IFileDbValueProps = { key, path, exists, deleted: false };
    if (!exists) {
      return { value: undefined, props: { ...props, exists: false } };
    }
    try {
      const text = (await fs.readFile(path)).toString();
      const json = JSON.parse(text);
      return typeof json === 'object' ? { value: json.data, props } : { value: undefined, props };
    } catch (error) {
      throw new Error(`Failed to get value for key '${key}'. ${error.message}`);
    }
  }
  public async getValue<T extends t.Json>(key: string): Promise<T> {
    const res = await this.get(key);
    return res.value as T;
  }
  public async getMany(keys: string[]): Promise<t.IFileDbValue[]> {
    return Promise.all(keys.map(key => this.get(key)));
  }

  /**
   * [Put]
   */
  public async put(key: string, value?: t.Json): Promise<t.IFileDbValue> {
    if (typeof value === 'object' && value !== null) {
      value = util.incrementTimestamps(value);
    }

    const res = await FileDb.put(this.dir, key.toString(), value);
    this.fire({
      type: 'DB/put',
      payload: { action: 'put', key, value: res.value, props: res.props },
    });

    if (this.cache.isEnabled) {
      this.cache.clear([key]); // Invalidate cache.
    }
    return res;
  }
  public static async put(dir: string, key: string, value?: t.Json): Promise<t.IFileDbValue> {
    const path = FileDb.toPath(dir, key);
    const json = { data: value };

    await fs.ensureDir(fs.dirname(path));
    await fs.writeFile(path, JSON.stringify(json, null, '  '));

    const props: t.IFileDbValueProps = { key, path, exists: true, deleted: false };
    return { value, props };
  }
  public async putMany(items: Array<{ key: string; value?: t.Json }>): Promise<t.IFileDbValue[]> {
    return Promise.all(items.map(({ key, value }) => this.put(key, value)));
  }

  /**
   * [Delete]
   */
  public async delete(key: string): Promise<t.IFileDbValue> {
    const res = await FileDb.delete(this.dir, key.toString());
    this.fire({
      type: 'DB/delete',
      payload: { action: 'delete', key, value: res.value, props: res.props },
    });
    return res;
  }
  public static async delete(dir: string, key: string): Promise<t.IFileDbValue> {
    const path = FileDb.toPath(dir, key);
    const existing = await FileDb.get(dir, key);
    let deleted = false;
    if (existing.props.exists) {
      const rename = `${path}${FileDb.DELETED_SUFFIX}`;
      await fs.rename(path, rename);
      deleted = true;
    }
    return {
      value: existing.value,
      props: { path, key, exists: false, deleted },
    };
  }
  public async deleteMany(keys: string[]): Promise<t.IFileDbValue[]> {
    return Promise.all(keys.map(key => this.delete(key)));
  }

  /**
   * Find (glob).
   */
  public async find(args: t.IFileDbFindArgs): Promise<t.IFileDbFindResult> {
    const { pattern = '' } = args;
    const recursive = defaultValue(args.recursive, true);
    let paths: string[] = [];

    if (pattern) {
      const dir = fs.join(this.dir, pattern);
      const isFile = await fs.is.file(dir);
      if (isFile) {
        paths = [dir];
      } else {
        const isDir = await fs.is.dir(dir);
        if (isDir) {
          const glob = recursive ? fs.join(dir, '**') : fs.join(dir, '*');
          paths = await fs.glob.find(glob);
        }
      }
    } else {
      paths = await fs.glob.find(fs.join(this.dir, '**'));
    }

    paths = paths.filter(path => path.endsWith('.json'));
    const keys = paths
      .map(path => path.substr(this.dir.length + 1))
      .map(path => path.substr(0, path.length - '.json'.length));

    const list = await this.getMany(keys);
    let obj: t.IFileDbFindResult['map'] | undefined;
    return {
      keys,
      paths,
      list,
      get map() {
        if (!obj) {
          obj = list.reduce((acc, next) => {
            acc[next.props.key] = next.value;
            return acc;
          }, {});
        }
        return obj;
      },
    };
  }

  /**
   * [Helpers]
   */

  public toPath(key: string) {
    return FileDb.toPath(this.dir, (key || '').toString());
  }

  public static toPath(dir: string, key: string) {
    return fs.join(dir, `${key}.json`);
  }

  private fire(e: t.FileDbEvent) {
    this._events$.next(e);
  }
}
