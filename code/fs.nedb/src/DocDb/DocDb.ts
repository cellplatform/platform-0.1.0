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
    const error: Error | undefined = undefined;
    const list: t.IDbValue[] = [];

    // try {
    //   const pattern = (typeof query === 'object' ? query.pattern : query) || '';
    //   const deep = typeof query === 'object' ? defaultValue(query.deep, true) : true;
    //   if (!pattern) {
    //     throw new Error(`A query pattern must contain at least a root TABLE name.`);
    //   }

    //   // Prepare search SQL statement.
    //   const key = PgDoc.parseKey(pattern, { requirePath: false });
    //   let sql = `SELECT * FROM "${key.table}"`;
    //   sql = key.path ? `${sql} WHERE path ~ '^${key.path}'` : sql;
    //   sql = `${sql};`;

    //   // Query the database.
    //   const res = await this.db.query(sql);
    //   list = res.rows
    //     .filter(row => {
    //       // NB: This may be able to be done in a more advanced regex in SQL above.
    //       return deep
    //         ? true // Deep: All child paths accepted.
    //         : !row.path.substring(key.path.length + 1).includes('/'); // Not deep: ensure this is not deeper than the given path.
    //     })
    //     .map(row => {
    //       const value = row && typeof row.data === 'object' ? (row.data as any).data : undefined;
    //       const { createdAt, modifiedAt } = PgDoc.toTimestamps(row);
    //       const res: t.IDbValue = {
    //         value,
    //         props: {
    //           key: PgDoc.join(key.table, row.path),
    //           exists: Boolean(value),
    //           createdAt,
    //           modifiedAt,
    //         },
    //       };
    //       return res;
    //     });
    // } catch (err) {
    //   error = err;
    // }

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
