import { Subject } from 'rxjs';
import { take, share } from 'rxjs/operators';
import { Store } from '../store';
import { t, R, time, defaultValue, DbUri, value as valueUtil } from '../common';

export type IDbDocArgs = {
  filename?: string;
};

export class DocDb {
  /**
   * [Static]
   */
  public static create(args: IDbDocArgs = {}) {
    return new DocDb(args);
  }

  private static toTimestamps(doc?: t.IDoc) {
    const createdAt = valueUtil.toNumber(doc ? doc.createdAt : -1);
    const modifiedAt = valueUtil.toNumber(doc ? doc.modifiedAt : -1);
    return { createdAt, modifiedAt };
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IDbDocArgs) {
    const { filename } = args;
    const autoload = Boolean(filename);
    this.store = Store.create<t.IDoc>({ filename, autoload });
    this.store.ensureIndex({ fieldName: 'path', unique: true });
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
  private readonly store: Store<t.IDoc>;
  private readonly uri = DbUri.create();

  private readonly _dispose$ = new Subject<{}>();
  public readonly dispose$ = this._dispose$.pipe(share());

  private readonly _events$ = new Subject<t.DbEvent>();
  public readonly events$ = this._events$.pipe(share());

  /**
   * [Methods]
   */

  public toString() {
    const filename = this.store.filename;
    return `[db:${filename ? filename : 'memory'}]`;
  }

  /**
   * [Get]
   */
  public async get(key: string): Promise<t.IDbValue> {
    this.throwIfDisposed('get');
    return (await this.getMany([key]))[0];
  }
  public async getMany(keys: string[]): Promise<t.IDbValue[]> {
    this.throwIfDisposed('getMany');

    const uris = keys.map(key => this.uri.parse(key));
    const paths = uris.map(uri => uri.path.dir);
    const docs = await this.store.find({ path: { $in: paths } });

    /**
     * TODO 🐷
     * - URI. object path
     */

    return uris.map(uri => {
      const key = uri.text;
      const doc = docs.find(item => item.path === uri.path.dir);
      const value = typeof doc === 'object' ? doc.data : undefined;
      const exists = Boolean(value);
      const { createdAt, modifiedAt } = DocDb.toTimestamps(doc);
      const res: t.IDbValue = {
        value,
        props: { key, exists, createdAt, modifiedAt },
      };
      return res;
    });
  }
  public async getValue<T extends t.Json | undefined>(key: string): Promise<T> {
    this.throwIfDisposed('putValue');
    const res = await this.get(key);
    return (res ? res.value : undefined) as T;
  }

  /**
   * [Put]
   */

  public async put(key: string, value?: t.Json, options?: t.IDbPutOptions): Promise<t.IDbValue> {
    this.throwIfDisposed('put');
    return (await this.putMany([{ key, value, ...options }]))[0];
  }
  public async putMany(items: t.IDbPutItem[]): Promise<t.IDbValue[]> {
    this.throwIfDisposed('putMany');
    const now = time.now.timestamp;

    let inserts = items.map(item => {
      const uri = this.uri.parse(item.key);
      const path = uri.path.dir;
      const createdAt = defaultValue(item.createdAt, now);
      const modifiedAt = defaultValue(item.modifiedAt, now);
      const data = item.value;
      const doc: t.IDoc = { path, data, createdAt, modifiedAt };
      return doc;
    });

    // Check for existing docs that need to updated (rather than inserted).
    const paths = inserts.map(doc => doc.path);
    const existing = await this.store.find({ path: { $in: paths } });

    // Perform updates.
    if (existing.length > 0) {
      const updates = inserts.filter(d1 => existing.some(d2 => d2.path === d1.path));
      await Promise.all(
        updates.map(update => {
          const query: any = { path: update.path };
          const current = existing.find(doc => doc.path === update.path);
          const createdAt = current ? current.createdAt : update.createdAt;
          update = { ...update, createdAt, modifiedAt: now };
          return this.store.update(query, update);
        }),
      );

      // Remove the existing updates from the new isnerts.
      inserts = inserts.filter(d1 => existing.some(d2 => d2.path !== d1.path));
    }

    // Perform inserts.
    if (inserts.length > 0) {
      await this.store.insertMany(inserts);
    }

    return this.getMany(items.map(item => item.key));
  }

  /**
   * [Delete]
   */

  public async delete(key: string): Promise<t.IDbValue> {
    this.throwIfDisposed('delete');
    return (await this.deleteMany([key]))[0];
  }
  public async deleteMany(keys: string[]): Promise<t.IDbValue[]> {
    this.throwIfDisposed('deleteMany');

    const uris = keys.map(key => this.uri.parse(key));
    const paths = uris.map(uri => uri.path.dir);
    const multi = paths.length > 0;
    await this.store.remove({ path: { $in: paths } }, { multi });

    return uris.map(uri => {
      const key = uri.text;
      const res: t.IDbValue = {
        value: undefined,
        props: { key, exists: false, createdAt: -1, modifiedAt: -1 },
      };
      return res;
    });
  }

  /**
   * [Find]
   */

  public async find(query: string | t.IDbQuery): Promise<t.IDbFindResult> {
    this.throwIfDisposed('find');

    let keys: string[] | undefined;
    let map: t.IDbFindResult['map'] | undefined;
    let error: Error | undefined;
    let list: t.IDbValue[] = [];

    try {
      // Prepare the query.
      const pattern = (typeof query === 'object' ? query.query : query) || '';
      const uri = this.uri.parse(pattern);
      const { dir, suffix } = uri.path;

      const buildQuery = () => {
        if (dir === '') {
          if (suffix === '') {
            return undefined;
          }
          if (suffix === '**') {
            return {}; // All documents in DB.
          }
          if (suffix === '*') {
            return { path: { $regex: /^([^/]*)$/ } }; // Only root level paths (eg "foo" not "foo/bar").
          }
          return;
        } else {
          const expr = suffix === '**' ? `^${dir}\/*` : `^${dir}\/([^/]*)$`;
          return { path: { $regex: new RegExp(expr) } };
        }
      };

      // Query the database.
      const q = buildQuery();
      const res = q ? await this.store.find(q) : [];

      // Convert into response list.
      list = res.map(doc => {
        const key = doc.path;
        const value = doc.data;
        const exists = Boolean(value);
        const { createdAt, modifiedAt } = doc;
        const res: t.IDbValue = {
          value,
          props: { key, exists, createdAt, modifiedAt },
        };
        return res;
      });
    } catch (err) {
      error = err;
    }

    // Return data structure.
    const result: t.IDbFindResult = {
      length: list.length,
      list,
      get keys() {
        if (!keys) {
          keys = list.map(item => item.props.key);
        }
        return keys;
      },
      get map() {
        if (!map) {
          map = list.reduce((acc, next) => ({ ...acc, [next.props.key]: next.value }), {});
        }
        return map;
      },
      error,
    };

    // Finish up.
    return result;
  }

  /**
   * [Helpers]
   */
  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      throw new Error(`Cannot ${action} because the ${this.toString()} has been disposed.`);
    }
  }
}
