import { ERROR, ErrorList, t } from '../../common';
import { TypeScript } from '../TypeScript';

/**
 * Validate namespace types.
 */
export function ns(args: { ns: string; typeDef: t.INsTypeDef; errors: ErrorList }) {
  const { ns, typeDef, errors } = args;

  // Ensure the object (ns) typename is valid.
  (() => {
    // NB: Empty typenames are not validated here as other errors will
    //     be picked up in this scenario, and reporting an invalid typename
    //     (only because it is empty) adds confusing noise to the error log.
    const typename = (typeDef.typename || '').trim();
    if (typename) {
      const res = TypeScript.validate.objectTypename(typename);
      if (res.error) {
        const message = res.error;
        errors.add(ns, message, { errorType: ERROR.TYPE.DEF_INVALID });
      }
    }
  })();

  // Check for duplicate typenames on REF (imported) types.
  (() => {
    type R = { typename: string; uri: string };
    const refs: R[] = [{ typename: typeDef.typename, uri: typeDef.uri }];

    typeDef.columns.forEach(columnDef => {
      TypeScript.walk(columnDef.type, e => {
        if (e.type.kind === 'REF') {
          const uri = e.type.uri;
          refs.push({ typename: e.type.typename, uri });
        }
      });

      refs
        .map(ref => {
          const total = refs.filter(m => m.typename === ref.typename).length;
          return { ref, total };
        })
        .filter(({ total }) => total > 1)
        .reduce((acc, next) => {
          if (!acc.some(ref => ref.typename === next.ref.typename)) {
            acc.push(next.ref);
          }
          return acc;
        }, [] as R[])
        .forEach(ref => {
          const message = `Reference to a duplicate typename '${ref.typename}'.`;
          errors.add(ns, message, { errorType: ERROR.TYPE.DUPLICATE_TYPENAME });
        });
    });
  })();

  // Finish up.
  return typeDef;
}

/**
 * Validate column types.
 */
export function columns(args: { ns: string; columns: t.IColumnTypeDef[]; errors: ErrorList }) {
  const { ns, columns, errors } = args;

  // Ensure there are no duplicate property names.
  (() => {
    const props = columns.map(c => c.prop);
    const duplicates: string[] = [];
    props.forEach(name => {
      if (!duplicates.includes(name)) {
        if (props.filter(prop => prop === name).length > 1) {
          duplicates.push(name);
        }
      }
    });

    duplicates.forEach(name => {
      const conficts = columns.filter(({ prop }) => prop === name).map(({ column }) => column);
      const message = `The property name '${name}' is duplicated in columns [${conficts}]. Must be unique.`;
      errors.add(ns, message, { errorType: ERROR.TYPE.DUPLICATE_PROP });
    });
  })();

  // Ensure there is no UNKNOWN types.
  (() => {
    columns
      .filter(column => column.type.kind === 'UNKNOWN')
      .forEach(column => {
        const message = `The property named '${column.prop}' (column ${column.column}) has an unknown type ("${column.type.typename}").`;
        errors.add(ns, message, { errorType: ERROR.TYPE.UNKNOWN });
      });
  })();

  // Finish up.
  return columns;
}
