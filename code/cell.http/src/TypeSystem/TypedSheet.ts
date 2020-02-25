import { defaultValue, Schema, t } from './common';
import { fetcher } from './fetch';
import { TypeClient } from './TypeClient';
import { TypedSheetCursor } from './TypedSheetCursor';

type ISheetArgs = {
  ns: string; // "ns:<uri>"
  fetch: t.ISheetFetcher;
};

/**
 * Represents a namespace as a logical sheet of cells.
 */
export class TypedSheet<T> implements t.ISheet<T> {
  public static async load<T>(args: ISheetArgs) {
    const res = await args.fetch.getType({ ns: args.ns });
    if (res.error) {
      throw new Error(res.error.message);
    }

    const type = res.type;
    const ns = (type.implements || '').trim();
    if (!ns) {
      const err = `The namespace [${args.ns}] does not contain an "implements" type reference.`;
      throw new Error(err);
    }

    const typeNs = Schema.uri.create.ns(ns);
    return new TypedSheet<T>({ ...args, typeNs }).load();
  }

  public static fromClient(client: string | t.IHttpClient) {
    const fetch = fetcher.fromClient({ client });
    return {
      load: <T>(ns: string) => TypedSheet.load<T>({ fetch, ns }),
    };
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: ISheetArgs & { typeNs: string }) {
    this.fetch = args.fetch;
    this.uri = args.ns;
    this.type = TypeClient.create({ fetch: args.fetch, ns: args.typeNs });
  }

  /**
   * [Fields]
   */
  private readonly fetch: t.ISheetFetcher;
  private readonly type: t.ITypeClient;
  public readonly uri: string;

  /**
   * [Properties]
   */
  public get ok() {
    return this.type.ok;
  }

  public get types() {
    return this.type.types;
  }

  /**
   * [Methods]
   */
  public async load() {
    await this.type.load();
    return this as t.ISheet<T>;
  }

  public async cursor(args: { index?: number; take?: number } = {}) {
    const ns = this.uri;
    const fetch = this.fetch;
    const types = this.types;
    const index = Math.max(0, defaultValue(args.index, 0));
    const { take } = args;
    return TypedSheetCursor.load<T>({ ns, fetch, types, index, take });
  }
}
