import { TypeValue } from '../TypeValue';
import { fetcher } from '../util';
import { constants, defaultValue, ERROR, R, Schema, t, ts, util, value } from '../common';

type ITypeClientArgs = {
  ns: string; // "ns:<uri>"
  fetch: t.ISheetFetcher;
};

const fromClient = (client: string | t.IHttpClient) => {
  const fetch = fetcher.fromClient({ client });
  return {
    create: (ns: string) => TypeClient.create({ fetch, ns }),
    load: (ns: string) => TypeClient.load({ fetch, ns }),
  };
};

/**
 * The type-system for a namespace.
 */
export class TypeClient implements t.ITypeClient {
  public static create = (args: ITypeClientArgs) => new TypeClient(args) as t.ITypeClient;
  public static load = (args: ITypeClientArgs) => TypeClient.create(args).load();
  public static client = fromClient;

  /**
   * [Lifecycle]
   */
  private constructor(args: ITypeClientArgs & { visited?: string[] }) {
    const ns = util.formatNs(args.ns);
    const uri = Schema.uri.parse<t.INsUri>(ns);

    if (uri.error) {
      const message = `Invalid namespace URI ("${args.ns}"). ${uri.error.message}`;
      this.error(message);
    }
    if (uri.parts.type !== 'NS') {
      const message = `Invalid namespace URI. Must be "ns", given: [${args.ns}]`;
      this.error(message);
    }

    this.uri = uri.toString();
    this.fetch = args.fetch;
    this.visited = args.visited || [];
  }

  /**
   * [Fields]
   */
  private readonly fetch: t.ISheetFetcher;
  private readonly visited: string[]; // NB: Used for short circuiting circular-refs.

  public readonly uri: string;
  public typename: string;
  public types: t.IColumnTypeDef[] = [];
  public errors: t.IError[] = [];

  /**
   * [Properties]
   */
  public get ok() {
    return this.errors.length === 0;
  }

  /**
   * [Methods]
   */

  public async load(): Promise<t.ITypeClient> {
    const ns = this.uri;
    const self = this as t.ITypeClient;

    if (!this.ok) {
      return self;
    }

    if (this.visited.includes(ns)) {
      const message = `The namespace "${ns}" leads back to itself (circular reference).`;
      this.error(message, { errorType: ERROR.TYPE.CIRCULAR_REF });
      return self;
    }

    this.visited.push(ns);
    this.errors = []; // NB: Reset any prior errors.

    try {
      // Retrieve namespace.
      const typeResponse = await this.fetch.getType({ ns });
      if (!typeResponse.exists) {
        const message = `The namespace "${ns}" does not exist.`;
        this.error(message, { errorType: ERROR.TYPE.DEF_NOT_FOUND });
        return self;
      }
      if (typeResponse.error) {
        this.error(typeResponse.error.message);
        return self;
      }
      if (typeResponse.type.implements === ns) {
        const message = `The namespace ("${ns}") cannot implement itself (circular-ref).`;
        this.error(message, { errorType: ERROR.TYPE.CIRCULAR_REF });
        return self;
      }

      // Retrieve columns.
      const columnsResponse = await this.fetch.getColumns({ ns });
      const { columns } = columnsResponse;
      if (columnsResponse.error) {
        this.error(columnsResponse.error.message);
        return self;
      }

      // Parse type details.
      this.typename = (typeResponse.type?.typename || '').trim();
      this.types = await this.readColumns({ columns });
    } catch (error) {
      this.error(`Failed while loading type for "${ns}". ${error.message}`);
    }

    // Finish up.
    return self;
  }

  public typescript(args: t.ITypeClientTypescriptArgs = {}) {
    const uri = this.uri;
    const pkg = constants.PKG.name || 'Unnamed';
    const header = defaultValue(args.header, true) ? toTypescriptHeader({ uri, pkg }) : undefined;

    const typename = this.typename;
    const types = this.types;

    return ts.toDeclaration({ typename, types, header });
  }

  public save(fs: t.IFs) {
    const typescript = async (dir: string, options: { filename?: string } = {}) => {
      const data = this.typescript();

      // Prepare paths.
      await fs.ensureDir(dir);
      let path = fs.join(dir, options.filename || this.typename);
      path = path.endsWith('.d.ts') ? path : `${path}.d.ts`;

      // Save file.
      await fs.writeFile(path, data);
      return { path, data };
    };

    return { typescript };
  }

  /**
   * [Internal]
   */

  private error(message: string, options: { errorType?: string; children?: t.IError[] } = {}) {
    const type = options.errorType || ERROR.TYPE.DEF;
    const error: t.IError = { message, type, children: options.children };
    this.errors.push(error);
    return value.deleteUndefined(error);
  }

  private async readColumns(args: { columns: t.IColumnMap }): Promise<t.IColumnTypeDef[]> {
    const wait = Object.keys(args.columns)
      .map(column => ({
        column,
        props: args.columns[column]?.props?.prop as t.CellTypeProp,
      }))
      .filter(({ props: prop }) => Boolean(prop))
      .map(async item => {
        const column = item.column;
        const target = item.props.target;
        const prop = item.props.name;

        const typeValue = (item.props.type || '').trim();

        const f = await this.readColumn({ column, props: item.props });
        // console.log('f', f);
        return f;

        // OLD-2
        // if (TypeValue.isRef(typeValue)) {
        //   const { type, error } = await this.readRef__OLD(column, typeValue); // <== RECURSION 🌳
        //   const res: t.IColumnTypeDef = { column, prop, type, target, error };
        //   return res;
        // } else {
        //   // TODO 🐷
        //   const res: t.IColumnTypeDef = { column, prop, type: typeValue, target };
        //   return res;
        // }

        // OLD-1
        // const res: t.IColumnTypeDef = { column, prop, type, target };
        // return TypeValue.isRef(type) ? this.readRef(res) : res;
      });
    return R.sortBy(R.prop('column'), await Promise.all(wait));
  }

  private async readColumn(args: {
    column: string;
    props: t.CellTypeProp;
  }): Promise<t.IColumnTypeDef> {
    const column = args.column;
    const prop = args.props.name;
    const target = args.props.target;
    let type = TypeValue.parse(args.props.type);
    let error: t.IError | undefined;

    if (type.kind === 'REF') {
      const res = await this.readRef({ column, ref: type });
      type = res.type;
      error = res.error ? res.error : error;
    }

    const def: t.IColumnTypeDef = { column, prop, type, target, error };

    // console.log('def.type', def.type);

    return value.deleteUndefined(def);
  }

  private async readRef(args: {
    column: string;
    ref: t.ITypeRef;
  }): Promise<{ type: t.ITypeRef | t.ITypeUnknown; error?: t.IError }> {
    const { column, ref } = args;
    const ns = ref.uri;
    const unknown: t.ITypeUnknown = { kind: 'UNKNOWN', typename: ns };

    if (!Schema.uri.is.ns(ns)) {
      this.error(`The referenced type in column '${column}' is not a namespace.`);
      return { type: unknown };
    }

    // Retrieve the referenced namespace.
    const fetch = this.fetch;
    const visited = this.visited;
    const nsType = new TypeClient({ ns, fetch, visited });
    await nsType.load(); // <== RECURSION 🌳

    const CIRCULAR_REF = ERROR.TYPE.CIRCULAR_REF;
    const isCircular = nsType.errors.some(err => err.type === CIRCULAR_REF);

    if (isCircular) {
      const msg = `The referenced type in column '${column}' ("${ns}") contains a circular reference.`;
      const children = nsType.errors;
      const error = this.error(msg, { children, errorType: CIRCULAR_REF });
      return { type: unknown, error };
    }

    if (!nsType.ok) {
      const msg = `The referenced type in column '${column}' ("${ns}") could not be read.`;
      const children = nsType.errors;
      const error = this.error(msg, { children, errorType: ERROR.TYPE.REF });
      return { type: unknown, error };
    }

    // Build the reference.
    // const { uri, typename, types } = nsType;
    const { typename, types } = nsType;
    const type: t.ITypeRef = { ...ref, typename, types };
    return { type };

    // const type: t.ITypeRef = { kind: 'REF', uri, typename, types };
    // return { ...ref, typename, types };
  }

  private async readRef__OLD(
    column: string,
    input: string,
  ): Promise<{ type: t.ITypeRef | t.ITypeUnknown; error?: t.IError }> {
    const unknown: t.ITypeUnknown = { kind: 'UNKNOWN', typename: input };

    //  Remove "=" prefix.
    const ns = (input || '').trim().replace(/^=/, '');
    if (!Schema.uri.is.ns(ns)) {
      this.error(`The referenced type in column '${column}' is not a namespace.`);
      return { type: unknown };
    }

    // Retrieve the referenced namespace.
    const fetch = this.fetch;
    const visited = this.visited;
    const nsType = new TypeClient({ ns, fetch, visited });
    await nsType.load(); // <== RECURSION 🌳

    const CIRCULAR_REF = ERROR.TYPE.CIRCULAR_REF;
    const isCircular = nsType.errors.some(err => err.type === CIRCULAR_REF);

    if (isCircular) {
      const msg = `The referenced type in column '${column}' ("${ns}") contains a circular reference.`;
      const children = nsType.errors;
      const error = this.error(msg, { children, errorType: CIRCULAR_REF });
      return { type: unknown, error };
    }

    if (!nsType.ok) {
      const msg = `The referenced type in column '${column}' ("${ns}") could not be read.`;
      const children = nsType.errors;
      const error = this.error(msg, { children, errorType: ERROR.TYPE.REF });
      return { type: unknown, error };
    }

    // Build the reference.
    const { uri, typename, types } = nsType;
    const type: t.ITypeRef = { kind: 'REF', uri, typename, types };
    return { type };
  }

  // private async readRef(def: t.IColumnTypeDef): Promise<t.IColumnTypeDef> {
  //   if (typeof def.type === 'object' || !TypeValue.isRef(def.type)) {
  //     return def;
  //   }

  //   const ns = def.type.substring(1); // NB: Remove "=" prefix.
  //   if (!Schema.uri.is.ns(ns)) {
  //     this.error(`The referenced type in column '${def.column}' is not a namespace.`);
  //     return def;
  //   }

  //   // Retrieve the referenced namespace.
  //   const fetch = this.fetch;
  //   const visited = this.visited;
  //   const nsType = new TypeClient({ ns, fetch, visited });
  //   await nsType.load(); // <== RECURSION 🌳

  //   const CIRCULAR_REF = ERROR.TYPE.CIRCULAR_REF;
  //   const isCircular = nsType.errors.some(err => err.type === CIRCULAR_REF);

  //   if (isCircular) {
  //     const msg = `The referenced type in column '${def.column}' ("${ns}") contains a circular reference.`;
  //     const children = nsType.errors;
  //     const error = this.error(msg, { children, errorType: CIRCULAR_REF });
  //     return { ...def, error };
  //   }

  //   if (!nsType.ok) {
  //     const msg = `The referenced type in column '${def.column}' ("${ns}") could not be read.`;
  //     const children = nsType.errors;
  //     const error = this.error(msg, { children, errorType: ERROR.TYPE.REF });
  //     return { ...def, error };
  //   }

  //   // Build the reference.
  //   const { uri, typename, types } = nsType;
  //   const type: t.ITypeRef = { kind: 'REF', uri, typename, types };
  //   return { ...def, type };
  // }
}

/**
 * [Helpers]
 */

function toTypescriptHeader(args: { uri: string; pkg: string }) {
  return `
  /**
   * Generated by [${args.pkg}] for CellOS namespace:
   * 
   *      ${args.uri}
   * 
   * Notes: 
   * 
   *    - Do NOT manually edit this file.
   *    - Do check this file into source control.
   *    - Import the [.d.ts] file within your consuming module
   *      that uses [TypedSheet]'s to operate on the namespace
   *      programatically with strong-typing.
   * 
   */`.substring(1);
}
