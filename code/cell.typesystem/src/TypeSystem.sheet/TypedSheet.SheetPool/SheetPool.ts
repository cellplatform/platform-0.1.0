import { Subject } from 'rxjs';
import { share, take } from 'rxjs/operators';

import { t } from '../../common';

type Item = { sheet: t.ITypedSheet; children: string[] };
type Items = { [ns: string]: Item };
type S = t.ITypedSheet | t.INsUri | string;

/**
 * In-memory cache pooling of [TypedSheet] instances.
 */
export class SheetPool implements t.ISheetPool {
  public static create = () => new SheetPool() as t.ISheetPool;

  /**
   * [Lifecycle]
   */

  private constructor() {}

  public dispose() {
    if (!this.isDisposed) {
      this._dispose$.next();
      this._dispose$.complete();
      this._items = {};
    }
  }

  /**
   * [Fields]
   */
  private readonly _dispose$ = new Subject<{}>();
  private _items: Items = {};

  public readonly dispose$ = this._dispose$.pipe(share());

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  public get count() {
    return Object.keys(this._items).length;
  }

  public get sheets() {
    const items = this._items;
    return Object.keys(items).reduce((acc: t.ISheetPool['sheets'], key) => {
      acc[key] = items[key].sheet;
      return acc;
    }, {});
  }

  /**
   * [Methods]
   */
  public exists(sheet: S) {
    this.throwIfDisposed('exists');
    return Boolean(this.sheet(sheet));
  }

  public sheet<T>(sheet: S) {
    this.throwIfDisposed('sheet');
    const ns = sheet.toString();
    const item = this._items[ns];
    return item ? (item.sheet as t.ITypedSheet<T>) : undefined;
  }

  public add(sheet: t.ITypedSheet, options: { parent?: S } = {}) {
    this.throwIfDisposed('add');
    if (this.exists(sheet)) {
      return this;
    }

    const ns = sheet.toString();
    this._items[ns] = { sheet, children: [] };
    sheet.dispose$.pipe(take(1)).subscribe(() => this.remove(sheet));

    // Add a "children" reference if the added sheet has a parent.
    if (options.parent) {
      const parent = this._items[options.parent.toString()];
      if (parent && !parent.children.includes(ns)) {
        parent.children.push(ns);
      }
    }

    return this;
  }

  public remove(sheet: S) {
    this.throwIfDisposed('remove');
    const ns = sheet.toString();
    const item = this._items[ns];
    delete this._items[ns];
    if (item) {
      item.children.forEach(child => this.remove(child));
    }
    return this;
  }

  public children(sheet: S) {
    this.throwIfDisposed('children');
    const build = (sheet: S, sheets: t.ITypedSheet[] = []) => {
      const ns = sheet.toString();
      if (!sheets.some(sheet => sheet.toString() === ns)) {
        const item = this._items[ns];
        if (item) {
          item.children.forEach(ns => {
            const child = this._items[ns];
            if (child) {
              sheets.push(child.sheet);
            }
            build(ns); // <== RECURSION 🌳
          });
        }
      }
      return sheets;
    };
    return build(sheet);
  }

  /**
   * [Internal]
   */

  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      throw new Error(`Cannot '${action}' because [SheetPool] is disposed.`);
    }
  }
}
