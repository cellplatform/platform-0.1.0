import { Uri, R, t, util, Schema } from './common';
import { TypedSheet } from './TypedSheet';

export type IArgs = {
  typename: string;
  typeDef: t.IColumnTypeDef<t.ITypeRef>;
  parent: t.ITypedSheetRefParent;
  ctx: t.SheetCtx;
};

/**
 * A connector for a reference-pointer to a set of rows in another sheet.
 */
export class TypedSheetRefs<T> implements t.ITypedSheetRefs<T> {
  public static PLACEHOLDER = `ns:${'0'.repeat(25)}`;

  public static create<T>(args: IArgs) {
    return new TypedSheetRefs<T>(args);
  }

  public static refLinkName(args: { typeDef: t.IColumnTypeDef<t.ITypeRef> }) {
    const { typeDef } = args;
    const nameKey = 'type'; // TODO: this will change when multi-types per cell is supported - this will be deribed from typeDef (probably)
    return nameKey;
  }

  public static refLinkKey(args: { typeDef: t.IColumnTypeDef<t.ITypeRef> }) {
    const { typeDef } = args;
    const nameKey = TypedSheetRefs.refLinkName({ typeDef });
    return Schema.ref.links.toKey(nameKey);
  }

  public static refLink(args: { typeDef: t.IColumnTypeDef<t.ITypeRef>; links?: t.IUriMap }) {
    const { typeDef, links = {} } = args;
    const linkName = TypedSheetRefs.refLinkName({ typeDef });
    const linkKey = TypedSheetRefs.refLinkKey({ typeDef });
    const link = Schema.ref.links.find(links).byName(linkName);
    return { linkKey, linkName, link };
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IArgs) {
    this.typeDef = args.typeDef;
    this.typename = args.typename;
    this.parent = args.parent;
    this._ctx = args.ctx;
  }

  /**
   * [Fields]
   */
  private readonly _ctx: t.SheetCtx;
  private _sheet: t.ITypedSheet<T>;
  private _load: Promise<t.ITypedSheetRefs<T>>;

  public ns: t.INsUri = Uri.ns(TypedSheetRefs.PLACEHOLDER, false);
  public readonly typeDef: t.IColumnTypeDef<t.ITypeRef>;
  public readonly typename: string;
  public readonly parent: t.ITypedSheetRefs<{}>['parent'];

  /**
   * [Properties]
   */
  public get isLoaded() {
    return Boolean(this._sheet);
  }

  public get sheet() {
    if (!this.isLoaded) {
      const err = `Sheet '${this.ns.toString()}' property called before ready [isLoaded].`;
      throw new Error(err);
    }
    return this._sheet;
  }

  /**
   * [Methods]
   */
  public async load(): Promise<t.ITypedSheetRefs<T>> {
    if (this.isLoaded) {
      return this;
    }

    if (this._load) {
      return this._load; // Aleady loading.
    }

    this.fire({
      type: 'SHEET/refs/loading',
      payload: { sheet: this.parent.sheet, refs: this },
    });

    const promise = new Promise<t.ITypedSheetRefs<T>>(async (resolve, reject) => {
      await this.ensureLink();

      const { fetch, cache, event$ } = this._ctx;
      const def = this.typeDef;

      this._sheet = await TypedSheet.create<T>({
        implements: def.type.uri,
        ns: this.ns.toString(),
        fetch,
        cache,
        event$,
      });

      delete this._load; // Remove temporary reference to loader promise.
      this.fire({
        type: 'SHEET/refs/loaded',
        payload: { sheet: this.parent.sheet, refs: this },
      });
      resolve(this);
    });

    this._load = promise; // Temporarily hold onto a reference so that any other calls to READY do not repeat the setup.
    return promise;
  }

  public async data(options: t.ITypedSheetDataOptions = {}) {
    if (!this.isLoaded) {
      await this.load();
    }
    const typename = this.typename;
    return this.sheet.data({ ...options, typename }).load();
  }

  /**
   * [Helpers]
   */
  private fire(e: t.TypedSheetEvent) {
    this._ctx.event$.next(e);
  }

  private async getCell() {
    const ns = this.parent.cell.ns;
    const key = this.parent.cell.key;
    const query = `${key}:${key}`;
    const res = await this._ctx.fetch.getCells({ ns, query });
    return (res.cells || {})[key];
  }

  private async ensureLink() {
    const typeDef = this.typeDef;
    const data = (await this.getCell()) || {};
    let links = data.links || {};
    const { linkKey, link } = TypedSheetRefs.refLink({ typeDef, links });

    // Look for an existing link on the cell if the current link is a placeholder.
    if (this.ns.toString() === TypedSheetRefs.PLACEHOLDER) {
      this.ns = link
        ? Uri.ns(link.uri.toString()) // Use existing link.
        : Uri.ns(Schema.cuid()); //      Generate new sheet link.
    }

    // Write the link-reference into the cell data.
    if (!links[linkKey]) {
      links = { ...links, [linkKey]: this.ns.toString() };
      const payload: t.ITypedSheetChange = {
        kind: 'CELL',
        ns: this.parent.sheet.uri.toString(),
        key: this.parent.cell.key,
        to: { ...data, links },
      };

      const isChanged = !R.equals(data, payload.to);
      if (isChanged) {
        this.fire({ type: 'SHEET/change', payload });
      }
    }
  }
}
