import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';
import { util, fs, t } from '../common';

/**
 * A DB that write to the file-system.
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
  constructor(args: { dir: string }) {
    this.dir = args.dir;
  }

  /**
   * [Fields]
   */
  public readonly dir: string;

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
    const res = await FileDb.get(this.dir, key.toString());
    this.fire({
      type: 'DB/get',
      payload: { action: 'get', key, value: res.value, props: res.props },
    });
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
