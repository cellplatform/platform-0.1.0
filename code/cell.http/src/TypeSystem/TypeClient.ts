import { HttpClient, Schema, ERROR, R } from './common';
import { toTypescriptDeclaration } from '../ts.def';
import * as t from './_types';

type ITypeNsArgs = {
  ns: string; // "ns:<uri>"
  fetch: t.ISheetFetcher;
};

/**
 * The type-system for a namespace.
 */
export class TypeClient implements t.ITypeClient {
  public static create = (args: ITypeNsArgs) => new TypeClient(args);
  public static load = (args: ITypeNsArgs) => TypeClient.create(args).load();

  /**
   * [Lifecycle]
   */
  private constructor(args: ITypeNsArgs) {
    const uri = Schema.uri.parse<t.INsUri>(args.ns);
    if (uri.error) {
      const message = `Invalid namespace URI. ${uri.error.message}`;
      this.error(message);
    }
    if (uri.parts.type !== 'NS') {
      const message = `Invalid namespace URI. Must be "ns", given: [${args.ns}]`;
      this.error(message);
    }

    this.uri = args.ns;
    this.fetch = args.fetch;
  }

  /**
   * [Fields]
   */
  private readonly fetch: t.ISheetFetcher;
  public readonly uri: string;
  public typename: string;
  public errors: t.IError[] = [];
  public types: t.ITypeDef[] = [];

  /**
   * [Properties]
   */
  public get ok() {
    return this.errors.length === 0;
  }

  public get typescript() {
    const typename = this.typename;
    const types = this.types;
    return toTypescriptDeclaration({ typename, types });
  }

  /**
   * [Methods]
   */

  public async load(): Promise<t.ITypeClient> {
    const self = this as t.ITypeClient;
    if (!this.ok) {
      return self;
    }
    this.errors = []; // NB: Reset any prior errors.

    // Retrieve namespace.
    const resColumns = await this.fetch.getColumns({ ns: this.uri });
    const { columns } = resColumns;

    if (resColumns.error) {
      this.error(resColumns.error.message);
      return self;
    }

    const resType = await this.fetch.getType({ ns: this.uri });
    if (resType.error) {
      this.error(resType.error.message);
      return self;
    }

    // Parse type details.
    this.typename = (resType.type?.typename || '').trim();
    this.types = await this.readColumns({ columns });

    // Finish up.
    return this;
  }

  /**
   * [Internal]
   */

  private error(message: string, options: { errorType?: string; children?: t.IError[] } = {}) {
    const type = options.errorType || ERROR.TYPE.NS;
    const children = options.children;
    const error: t.IError = { message, type, children };
    this.errors.push(error);
    return error;
  }

  private async readColumns(args: { columns: t.IColumnMap }): Promise<t.ITypeDef[]> {
    const wait = Object.keys(args.columns)
      .map(column => ({
        column,
        prop: args.columns[column]?.props?.prop as t.CellTypeProp,
      }))
      .filter(({ prop }) => Boolean(prop))
      .map(async ({ column, prop }) => {
        const { name, target } = prop;
        const type = (prop.type || '').trim();
        const res: t.ITypeDef = { column, prop: name, type, target };
        return type.startsWith('=') ? this.readRef(res) : res;
      });
    return R.sortBy(R.prop('column'), await Promise.all(wait));
  }

  private async readRef(column: t.ITypeDef): Promise<t.ITypeDef> {
    const { type } = column;
    if (typeof type === 'object' || !type.startsWith('=')) {
      return column;
    }

    const ns = type.substring(1);
    if (!Schema.uri.is.ns(ns)) {
      const err = `The referenced type in column '${column.column}' is not a namespace.`;
      this.error(err);
      return column;
    }

    // Retrieve the referenced namespace.
    const fetch = this.fetch;
    const nsType = await TypeClient.load({ fetch, ns });
    if (!nsType.ok) {
      const msg = `The referenced type in column '${column.column}' (${ns}) could not be retrieved.`;
      const children = nsType.errors;
      const error = this.error(msg, { children, errorType: ERROR.TYPE.NS_NOT_FOUND });
      return { ...column, error };
    }

    // Build the reference.
    const { uri, typename, types: columns } = nsType;
    return { ...column, type: { uri, typename, types: columns } };
  }
}
