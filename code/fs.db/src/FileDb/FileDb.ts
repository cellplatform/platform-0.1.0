import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';
import { util, fs, t, defaultValue } from '../common';

export type IFileDbArgs = {
  dir: string;
  cache?: boolean;
};

/**
 * A DB that writes to the file-system.
 */
export class FileDb implements t.IDb {
  /**
   * [Static]
   */
  public static DELETED_SUFFIX = '._del';
  public static ensureTimestamps = util.ensureTimestamps;
  public static incrementTimestamps = util.incrementTimestamps;

  public static create(args: IFileDbArgs) {
    return new FileDb(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IFileDbArgs) {
    this.dir = fs.resolve(args.dir);
    this.cache.isEnabled = Boolean(args.cache);
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  /**
   * [Fields]
   */
  public readonly dir: string;

  public readonly cache: t.IDbCache = {
    isEnabled: false,
    values: {},
    exists: (key: string) => this.cache.values[key] !== undefined,
    clear: (keys?: string[]) => {
      const remove = (key: string) => {
        if (this.cache.exists(key)) {
          delete this.cache.values[key];
          this.fire({ type: 'DOC/cache', payload: { key, action: 'REMOVED' } });
        }
      };
      (keys || Object.keys(this.cache.values)).forEach(remove);
    },
  };

  private readonly _dispose$ = new Subject<{}>();
  public readonly dispose$ = this._dispose$.pipe(share());

  private readonly _events$ = new Subject<t.DbEvent>();
  public readonly events$ = this._events$.pipe(share());

  /**
   * [Methods]
   */
  public toString() {
    return `[DB:${this.dir}]`;
  }

  /**
   * [Get]
   */
  public async get(key: string): Promise<t.IDbValue> {
    const cachedValue = this.cache.isEnabled ? this.cache.values[key] : undefined;

    const fire = (result: t.IDbValue) => {
      const { value, props } = result;
      this.fire({
        type: 'DOC/read',
        payload: { action: 'get', key, value, props },
      });
    };

    // Return value from cache.
    if (this.cache.isEnabled && cachedValue !== undefined) {
      fire(cachedValue);
      return cachedValue;
    }

    // Read value from file-system.
    const res = await FileDb.get(this.dir, key.toString());
    fire(res);

    // Store value in cache (if required).
    if (this.cache.isEnabled) {
      this.cache.values[key] = res;
    }

    // Finish up.
    return res;
  }
  public static async get(dir: string, key: string): Promise<t.IDbValue> {
    const path = FileDb.toPath(dir, key);
    const exists = await fs.pathExists(path);
    const props: t.IDbValueProps = { key, exists, createdAt: -1, modifiedAt: -1 };
    if (!exists) {
      return { value: undefined, props: { ...props, exists: false } };
    }
    try {
      const text = (await fs.readFile(path)).toString();
      const json = JSON.parse(text);
      if (typeof json === 'object') {
        props.createdAt = typeof json.createdAt === 'number' ? json.createdAt : props.createdAt;
        props.modifiedAt = typeof json.modifiedAt === 'number' ? json.modifiedAt : props.modifiedAt;
      }
      return typeof json === 'object' ? { value: json.data, props } : { value: undefined, props };
    } catch (error) {
      throw new Error(`Failed to get value for key '${key}'. ${error.message}`);
    }
  }
  public async getValue<T extends t.Json | undefined>(key: string): Promise<T> {
    const res = await this.get(key);
    return res.value as T;
  }
  public async getMany(keys: string[]): Promise<t.IDbValue[]> {
    return Promise.all(keys.map(key => this.get(key)));
  }

  /**
   * [Put]
   */
  public async put(key: string, value?: t.Json): Promise<t.IDbValue> {
    if (typeof value === 'object' && value !== null) {
      value = util.incrementTimestamps(value);
    }

    const res = await FileDb.put(this.dir, key.toString(), value);
    this.fire({
      type: 'DOC/change',
      payload: { action: 'put', key, value: res.value, props: res.props },
    });

    if (this.cache.isEnabled) {
      this.cache.clear([key]); // Invalidate cache.
    }
    return res;
  }
  public static async put(dir: string, key: string, value?: t.Json): Promise<t.IDbValue> {
    const existing = await FileDb.get(dir, key);
    const path = FileDb.toPath(dir, key);

    const json = util.incrementTimestamps({
      data: value,
      createdAt: existing.props.createdAt,
      modifiedAt: existing.props.modifiedAt,
    });

    await fs.ensureDir(fs.dirname(path));
    await fs.writeFile(path, JSON.stringify(json, null, '  '));

    const props: t.IDbValueProps = {
      key,
      exists: true,
      createdAt: json.createdAt,
      modifiedAt: json.modifiedAt,
    };
    return { value, props };
  }
  public async putMany(items: t.IDbKeyValue[]): Promise<t.IDbValue[]> {
    return Promise.all(items.map(({ key, value }) => this.put(key, value)));
  }

  /**
   * [Delete]
   */
  public async delete(key: string): Promise<t.IDbValue> {
    const res = await FileDb.delete(this.dir, key.toString());
    this.fire({
      type: 'DOC/change',
      payload: { action: 'delete', key, value: res.value, props: res.props },
    });
    return res;
  }
  public static async delete(dir: string, key: string): Promise<t.IDbValue> {
    const path = FileDb.toPath(dir, key);
    const existing = await FileDb.get(dir, key);
    if (existing.props.exists) {
      const rename = `${path}${FileDb.DELETED_SUFFIX}`;
      await fs.rename(path, rename);
    }
    return {
      value: undefined,
      props: { key, exists: false, createdAt: -1, modifiedAt: -1 },
    };
  }
  public async deleteMany(keys: string[]): Promise<t.IDbValue[]> {
    return Promise.all(keys.map(key => this.delete(key)));
  }

  /**
   * Find (glob).
   */
  public async find(query: string | t.IDbQuery): Promise<t.IDbFindResult> {
    const pattern = (typeof query === 'object' ? query.pattern : query) || '';
    const deep = typeof query === 'object' ? defaultValue(query.deep, true) : true;
    let paths: string[] = [];

    if (pattern) {
      const dir = fs.join(this.dir, pattern);
      const isFile = await fs.is.file(dir);
      if (isFile) {
        paths = [dir];
      } else {
        const isDir = await fs.is.dir(dir);
        if (isDir) {
          const glob = deep ? fs.join(dir, '**') : fs.join(dir, '*');
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
    let obj: t.IDbFindResult['map'] | undefined;
    return {
      keys,
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

  private fire(e: t.DbEvent) {
    this._events$.next(e);
  }
}
