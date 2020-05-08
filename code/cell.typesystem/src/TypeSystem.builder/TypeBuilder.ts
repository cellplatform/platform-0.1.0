import { t, value, Uri } from '../common';
import { TypeBuilderNs } from './TypeBuilderNs';
import { TypeValue } from '../TypeSystem.core';

/**
 * A structured API for building a set of type-definitions in code.
 */
export class TypeBuilder implements t.ITypeBuilder {
  public static create = () => new TypeBuilder() as t.ITypeBuilder;

  /**
   * [Lifecycle]
   */
  private constructor() {}

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

  public ns(uri: string | t.INsUri) {
    uri = Uri.ns(uri);
    const exists = this.builders.some(ns => ns.uri.toString() === uri.toString());
    if (exists) {
      const err = `The namespace '${uri.toString()}' already exists`;
      throw new Error(err);
    }
    const ns = TypeBuilderNs.create({ uri });
    this.builders.push(ns);
    return ns;
  }

  public type(typename: string, options?: t.ITypeBuilderNsTypeOptions) {
    const ns = Uri.create.ns(Uri.cuid());
    return this.ns(ns).type(typename, options);
  }

  public formatType(value: string) {
    value = (value || '').trim();

    if (value.startsWith('/')) {
      // For referenced types (shorthand "/<typename>")
      const typename = value.replace(/^\/*/, '');
      const singular = TypeValue.trimArray(typename);
      const match = this.builders.find(ns => ns.types.find(type => type.typename === singular));
      if (!match) {
        const err = `Failed to prefix type '${value}' with namespace. The typename '${typename}' was not found in any of the available namespaces.`;
        throw new Error(err);
      }
      value = `${match.uri.toString()}/${typename}`;
    }

    return value;
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

    ns.types.forEach(type => {
      const typename = type.typename;
      type.props
        .map(prop => prop.toObject())
        .forEach(prop => {
          const def: t.CellTypeDef = value.deleteUndefined({
            prop: `${typename}.${prop.name}`,
            type: this.formatType(prop.type),
            target: prop.target,
            default: prop.default,
          });
          const column = getOrCreateObject(columns, prop.column);
          attachDef(def, column);
        });
    });

    return { columns };
  }
}
