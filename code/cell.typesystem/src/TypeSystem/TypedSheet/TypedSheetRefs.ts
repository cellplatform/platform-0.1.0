import { R, t, util, Schema } from './common';
import { TypedSheet } from './TypedSheet';

export type IArgs = {
  typename: string;
  typeDef: t.IColumnTypeDef<t.ITypeRef>;
  parent: string | t.ICellUri;
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
    this.parent = util.formatCellUri(args.parent);
    this.ctx = args.ctx;
  }

  /**
   * [Fields]
   */
  private readonly ctx: t.SheetCtx;
  private _sheet: t.ITypedSheet<T>;
  private _load: Promise<t.ITypedSheetRefs<T>>;

  public readonly typeDef: t.IColumnTypeDef<t.ITypeRef>;
  public ns: t.INsUri = util.formatNsUri(TypedSheetRefs.PLACEHOLDER);
  public readonly typename: string;
  public readonly parent: t.ICellUri;

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
      return this._load; // Single loader.
    }

    const promise = new Promise<t.ITypedSheetRefs<T>>(async (resolve, reject) => {
      await this.ensureLink();

      const { fetch, cache, events$ } = this.ctx;
      const def = this.typeDef;

      this._sheet = await TypedSheet.create<T>({
        implements: def.type.uri,
        ns: this.ns.toString(),
        fetch,
        cache,
        events$,
      });

      delete this._load; // Remove temporary load cache.
      resolve(this);
    });

    this._load = promise; // Temporarily cache so that any other calls to READY do not repeat the setup.
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
    this.ctx.events$.next(e);
  }

  private async getCell() {
    const ns = this.parent.ns;
    const key = this.parent.key;
    const query = `${key}:${key}`;
    const res = await this.ctx.fetch.getCells({ ns, query });
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
        ? util.formatNsUri(link.uri.toString()) // Use existing link.
        : util.formatNsUri(Schema.cuid()); //      Generate new sheet link.
    }

    // Write the link-reference into the cell data.
    if (!links[linkKey]) {
      links = { ...links, [linkKey]: this.ns.toString() };
      const payload: t.ITypedSheetChange = {
        cell: this.parent.toString(),
        data: { ...data, links },
      };

      const isChanged = !R.equals(data, payload.data);
      if (isChanged) {
        this.fire({ type: 'SHEET/change', payload });
      }
    }
  }
}
