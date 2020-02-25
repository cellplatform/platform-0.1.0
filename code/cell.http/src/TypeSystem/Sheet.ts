import { Schema, HttpClient, defaultValue } from './common';
import { TypeClient } from './TypeClient';
import * as t from './_types';
import { SheetCursor } from './SheetCursor';

type ISheetArgs = {
  ns: string; // "ns:<uri>"
  // client: string | t.IHttpClient;
  fetch: t.ISheetFetcher;
};

/**
 * Represents a namespace as a logical sheet of cells.
 */
export class Sheet<T> implements t.ISheet<T> {
  public static async load<T>(args: ISheetArgs) {
    /**
     * TODO 🐷
     * - delete client ref.
     * - change data-fetcher to use a sigle method:
     *    `.readNs(args)` <== same args as client `client.ns(..).read({})`
     */

    const res = await args.fetch.getType({ ns: args.ns });
    if (res.error) {
      throw new Error(res.error.message);
    }

    const type = res.type;
    if (!type) {
      const err = `The namespace [${args.ns}] does not contain a type reference.`;
      throw new Error(err);
    }

    const ns = (type.implements || '').trim();
    if (!ns) {
      const err = `The namespace [${args.ns}] does not contain an "implements" type reference.`;
      throw new Error(err);
    }

    const typeNs = Schema.uri.create.ns(ns);
    return new Sheet<T>({ ...args, typeNs }).load();
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
    return SheetCursor.load<T>({ ns, fetch, types, index, take });
  }
}
