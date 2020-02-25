import { Schema, HttpClient, defaultValue } from './common';
import { TypeClient } from './TypeClient';
import * as t from './_types';
import { SheetCursor } from './SheetCursor';

type ISheetArgs = {
  ns: string; // "ns:<uri>"
  client: string | t.IHttpClient;
};

/**
 * Represents a namespace as a logical sheet of cells.
 */
export class Sheet<T> implements t.ISheet<T> {
  public static async load<T>(args: ISheetArgs) {
    const client = typeof args.client === 'string' ? HttpClient.create(args.client) : args.client;

    const sheet = (await client.ns(args.ns).read()).body;
    if (!sheet.exists) {
      const err = `The namespace [${args.ns}] does not exist.`;
      throw new Error(err);
    }

    const type = sheet.data.ns.props?.type;
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
    this.uri = args.ns;
    this.client = typeof args.client === 'string' ? HttpClient.create(args.client) : args.client;

    const client = this.client;
    this.type = TypeClient.create({ client, ns: args.typeNs });
  }

  /**
   * [Fields]
   */
  private readonly client: t.IHttpClient;
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
    const client = this.client;
    const types = this.types;
    const index = Math.max(0, defaultValue(args.index, 0));
    const { take } = args;
    return SheetCursor.load<T>({ ns, client, types, index, take });
  }
}
