import { t, value, Uri } from '../common';
import { TypeBuilderNs } from './TypeBuilderNs';
import { TypeValue, TypeProp, TypeDefault, TypeClient } from '../TypeSystem.core';

/**
 * A structured API for building a set of type-definitions in code.
 */
export class TypeBuilder implements t.ITypeBuilder {
  public static create = () => new TypeBuilder() as t.ITypeBuilder;

  /**
   * [Lifecycle]
   */
  private constructor() {} // eslint-disable-line

  /**
   * [Fields]
   */
  private builders: t.ITypeBuilderNs[] = [];

  /**
   * [Methods]
   */
  public toObject() {
    return this.builders.reduce((acc: t.ITypeBuilderDefs, builder) => {
      const ns = builder.uri.toString();
      acc[ns] = this.toDef(builder);
      return acc;
    }, {});
  }

  public toTypeDefs() {
    return this.builders.reduce((acc: t.INsTypeDef[], builder) => {
      return [...acc, ...this.toTypeDef(builder)];
    }, []);
  }

  public ns(uri?: string | t.INsUri) {
    uri = typeof uri === 'string' ? uri.trim() : uri;
    const ns = uri ? Uri.ns(uri) : Uri.create.ns(Uri.cuid());

    const exists = this.builders.some((builder) => builder.toString() === ns.toString());
    if (exists) {
      const err = `The namespace '${ns.toString()}' already exists`;
      throw new Error(err);
    }

    const res = TypeBuilderNs.create({ uri: ns });
    this.builders.push(res);
    return res;
  }

  public type(typename: string, options?: t.ITypeBuilderNsTypeOptions) {
    return this.ns().type(typename, options);
  }

  public formatType(value: string) {
    value = (value || '').trim();

    if (value.startsWith('/')) {
      // For referenced types (shorthand "/<typename>")
      const typename = value.replace(/^\/*/, '');
      const singular = TypeValue.trimArray(typename);
      const match = this.builders.find((ns) => ns.types.find((type) => type.typename === singular));
      if (!match) {
        const err = `Failed to prefix type '${value}' with namespace. The typename '${typename}' was not found in any of the available namespaces.`;
        throw new Error(err);
      }
      value = `${match.uri.toString()}/${typename}`;
    }

    return value;
  }

  public async write(http: t.IHttpClient) {
    const defs = this.toObject();
    const typeDefs = this.toTypeDefs();

    const saved: { typename: string; ns: string }[] = [];
    const exists: { typename: string; ns: string }[] = [];
    const errors: { typename: string; ns: string; error: t.IHttpError }[] = [];

    const save = async (typeDef: t.INsTypeDef) => {
      const ns = typeDef.uri;
      const typename = typeDef.typename;
      const def = defs[ns];
      const client = http.ns(ns);
      if (!(await client.exists())) {
        const { error } = await client.write(def);
        if (error) {
          errors.push({ typename, ns, error });
        } else {
          saved.push({ typename, ns });
        }
      } else {
        exists.push({ typename, ns });
      }
    };
    await Promise.all(typeDefs.map((typeDef) => save(typeDef)));
    return { ok: errors.length === 0, saved, exists, errors };
  }

  public typescript(options?: t.ITypeClientTypescriptOptions) {
    const typeDefs = this.toTypeDefs();
    return TypeClient.typescript(typeDefs, options);
  }

  /**
   * [Internal]
   */

  private toDef(ns: t.ITypeBuilderNs): t.ITypeDefPayload {
    const columns: t.IColumnMap = {};

    const getOrCreateObject = <T>(target: T, key: string): T => {
      return target[key] ? target[key] : (target[key] = {});
    };

    const attachDef = (def: t.CellTypeDef, column: t.IColumnMap) => {
      const props = getOrCreateObject<t.IColumnProps>(column, 'props');
      if (!props.def) {
        props.def = def;
      } else {
        if (!Array.isArray(props.def)) {
          props.def = [props.def];
        }
        props.def.push(def);
      }
    };

    ns.types.forEach((type) => {
      const typename = type.typename;
      type.props
        .map((prop) => prop.toObject())
        .forEach((prop) => {
          const def: t.CellTypeDef = value.deleteUndefined({
            prop: `${typename}.${prop.name}`,
            type: this.formatType(prop.type),
            default: prop.default,
            target: prop.target,
          });
          const column = getOrCreateObject(columns, prop.column);
          attachDef(def, column);
        });
    });

    return { columns };
  }

  private toTypeDef(ns: t.ITypeBuilderNs) {
    const uri = ns.uri.toString();
    const columns = this.toDef(ns).columns;
    const res: t.INsTypeDef[] = [];

    const add = (column: string, item: t.CellTypeDef) => {
      const { prop, type: typename, optional } = TypeProp.parse(item.prop);

      const exists = res.some((def) => def.typename === typename);
      if (!exists) {
        res.push({ uri, typename, columns: [], errors: [] });
      }

      const typeDef = res.find((def) => def.typename === typename);
      if (typeDef) {
        typeDef.columns.push({
          column,
          prop,
          type: TypeValue.toType(item.type),
          target: item.target,
          default: TypeDefault.toTypeDefault(item.default),
          optional,
        });
      }
    };

    Object.keys(columns).forEach((column) => {
      const props = columns[column]?.props || {};
      if (props.def) {
        const defs = Array.isArray(props.def) ? props.def : [props.def];
        defs.forEach((item) => add(column, item));
      }
    });

    return res;
  }
}
