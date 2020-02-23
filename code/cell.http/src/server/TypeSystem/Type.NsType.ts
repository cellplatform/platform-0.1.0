import { t, HttpClient, Schema, ERROR, R } from '../common';

type ITypeNsArgs = {
  client: string | t.IHttpClient;
  ns: string; // "ns:<uri>"
};

/**
 * TODO 🐷 move to [cell.types]
 */
export type INsType = {
  readonly ok: boolean;
  readonly uri: string;
  readonly typename: string;
  readonly errors: t.IError[];
  readonly types: IColumnType[];
  readonly typescript: string;
};

export type IColumnType = {
  column: string;
  typename: string;
  type: string | IRefType;
  error?: t.IError;
};

export type IRefType = {
  uri: string;
  typename: string;
  types: IColumnType[];
};

/**
 * The type-system for a namespace.
 */
export class NsType implements INsType {
  public static create = (args: ITypeNsArgs) => new NsType(args);
  public static read = (args: ITypeNsArgs) => NsType.create(args).read();

  /**
   * [Lifecycle]
   */
  private constructor(args: ITypeNsArgs) {
    const uri = Schema.uri.parse<t.INsUri>(args.ns);
    if (uri.error) {
      const message = `Invalid namespace URI for [TypeNS]. ${uri.error.message}`;
      this.error(message);
    }
    if (uri.parts.type !== 'NS') {
      const message = `Invalid namespace URI for [TypeNS]. Must be "ns", given: [${args.ns}]`;
      this.error(message);
    }

    this.client = typeof args.client === 'string' ? HttpClient.create(args.client) : args.client;
    this.uri = args.ns;
  }

  /**
   * [Fields]
   */
  private readonly client: t.IHttpClient;

  public readonly uri: string;
  public typename: string;
  public errors: t.IError[] = [];
  public types: IColumnType[] = [];

  /**
   * [Properties]
   */
  public get ok() {
    return this.errors.length === 0;
  }

  public get typescript() {
    // const columns = this.col

    console.log('-------------------//////------------------------');
    const typename = this.typename;
    const types = this.types;

    console.log('types', types);

    const ts = toTypescriptDeclaration({ typename, types });

    return ts;
  }

  /**
   * [Methods]
   */

  /**
   * Reads in namespace data from the network.
   */
  public async read(): Promise<INsType> {
    if (!this.ok) {
      return this;
    }
    this.errors = []; // NB: Reset any prior errors.

    // Retrieve namespace.
    const res = await this.client.ns(this.uri).read({ columns: true });
    const exists = res.body.exists;
    if (res.error || !exists) {
      let message = `Failed while retrieving namespace info (${this.uri}).`;
      message = res.error ? `${message} ${res.error.message}` : message;

      const errorType = res.status === 404 || !exists ? ERROR.TYPE.NS_NOT_FOUND : ERROR.TYPE.NS;
      this.error(message, { errorType });
      return this;
    }

    // Parse type details.
    const { ns, columns = {} } = res.body.data;
    this.typename = ns?.props?.type?.typename || '';
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

  private async readColumns(args: { columns: t.IColumnData }): Promise<IColumnType[]> {
    const wait = Object.keys(args.columns)
      .map(column => ({ column, props: args.columns[column].props }))
      .filter(({ props }) => Boolean(props))
      .map(async ({ column, props }) => {
        const { typename } = props;
        const type = (props.type || '').trim();
        const res: IColumnType = { column, typename, type };
        return type.startsWith('=') ? this.readRef(res) : res;
      });
    return R.sortBy(R.prop('column'), await Promise.all(wait));
  }

  private async readRef(column: IColumnType): Promise<IColumnType> {
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
    const client = this.client;
    const nsType = await NsType.read({ client, ns });
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

/**
 * [Helpers]
 */

function toTypescriptDeclaration(args: { typename: string; types: IColumnType[] }) {
  const lines = args.types.map(item => {
    const name = item.typename;
    const type = typeof item.type === 'string' ? item.type : item.type.typename;
    return `    ${name}: ${type};`;
  });

  let res = `
export declare type ${args.typename} = {
${lines.join('\n')}
};`.substring(1);

  args.types.forEach(({ type }) => {
    if (typeof type === 'object') {
      const { typename, types } = type;
      res = `${res}\n\n${toTypescriptDeclaration({ typename, types })}`;
    }
  });

  return res;
}
