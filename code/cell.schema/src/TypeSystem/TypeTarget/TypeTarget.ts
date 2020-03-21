import { Uri, t, ERROR, squash } from '../common';
import { RefLinks } from '../../Ref';

type Input = t.CellTypeTarget | t.IColumnTypeDef;
const asTarget = (input?: Input) => {
  return ((typeof input === 'object' ? input.target : input) || '').trim() || 'inline';
};

/**
 * Parser for interpreting a [target] reference within an [ITypeDef].
 *
 * See: [CellTypeTarget]
 *      for master documentation on formats and usage.
 */

export class TypeTarget {
  /**
   * Parses a cell target into its constituent parts.
   */
  public static parse(input?: Input): t.CellTypeTargetInfo {
    const target = asTarget(input);

    let isValid = true;

    const errors: t.IError[] = [];
    const addError = (message: string) => {
      isValid = false;
      const type = ERROR.TYPE.TARGET;
      errors.push({ message, type });
    };

    // Derive target "kind".
    let kind: t.CellTypeTargetInfo['kind'] = 'UNKNOWN';
    let isRef = false;
    let isInline = false;
    if (TypeTarget.isRef(target)) {
      kind = 'ref';
      isRef = true;
    }
    if (TypeTarget.isInline(target)) {
      kind = 'inline';
      isInline = true;
    }
    if (kind === 'UNKNOWN') {
      addError(`Type target '${target}' is invalid. Should be "ref" "inline" or "inline:<prop>".`);
    }

    // Derive target "path".
    let path = '';
    if (isValid && kind === 'inline') {
      path = target.substring(kind.length + 1);
      path = path ? `props:${path}` : 'value';
    }
    if (isValid && kind === 'ref') {
      path = ''; // NB: The data is stored remotely, so a local path is not relevant.
    }

    // Finish up.
    return {
      target,
      isValid,
      isRef,
      isInline,
      errors,
      kind,
      path,
      toString: () => target,
    };
  }

  /**
   * Determine if the given target type is inline
   */
  public static isInline(input?: Input) {
    const target = asTarget(input);
    return target === 'inline' || target.startsWith('inline:');
  }

  public static isRef(input?: Input) {
    return asTarget(input) === 'ref';
  }

  /**
   * Read/write data locally within a cell.
   */
  public static inline(typeDef: t.IColumnTypeDef) {
    const target = TypeTarget.parse(typeDef);
    return {
      /**
       * Read local value.
       */
      read<V extends t.Json>(cell: t.ICellData<any>) {
        if (!target.isValid) {
          throw new Error(`READ: The target '${target}' is not valid.`);
        }
        if (!target.isInline) {
          throw new Error(`READ: The target '${target}' is not 'inline'.`);
        }

        const path = target.path;
        if (path === 'value') {
          return cell.value as V;
        }

        const PROPS = 'props:';
        if (path.startsWith(PROPS)) {
          const field = path.substring(PROPS.length);
          return (cell.props || {})[field] as V;
        }

        return;
      },

      /**
       * Write local value.
       */
      write<V extends t.Json>(args: { data: V | undefined; cell?: t.ICellData<any> | undefined }) {
        const cell = { ...(args.cell || {}) };

        if (!target.isValid) {
          throw new Error(`WRITE: The target '${target}' is not valid.`);
        }
        if (!target.isInline) {
          throw new Error(`WRITE: The target '${target}' is not 'inline'.`);
        }

        const path = target.path;
        if (path === 'value') {
          if (args.data === undefined) {
            delete cell.value;
          } else {
            cell.value = args.data;
          }
        }

        const PROPS = 'props:';
        if (path.startsWith(PROPS)) {
          const field = path.substring(PROPS.length);
          cell.props = cell.props || {};
          if (args.data === undefined) {
            delete cell.props[field];
          } else {
            cell.props[field] = args.data;
          }
        }

        // Finish up.
        cell.props = squash.props(cell.props);
        return squash.cell(cell) || {};
      },
    };
  }

  /**
   * Read/write reference links.
   */
  public static ref(typeDef: t.IColumnTypeDef<t.ITypeRef>) {
    if (typeDef.target !== 'ref') {
      const given = typeDef.target === undefined ? '<undefined>' : typeDef.target || '<empty>';
      const err = `The given target is not "ref" (given "${given}")`;
      throw new Error(err);
    }
    if ((typeDef.type.kind as t.IType['kind']) !== 'REF') {
      const err = `The given type is not of kind REF (given "${typeDef.type.kind}")`;
      throw new Error(err);
    }
    if (typeDef.type.scope !== 'NS') {
      const scope = typeDef.type.scope;
      const err = `The given REF type does not reference a NS (given scope "${scope}")`;
      throw new Error(err);
    }

    const target = TypeTarget.parse(typeDef);

    return {
      /**
       * Read reference link.
       */
      read() {
        //
        // TODO 🐷
      },

      /**
       * Write reference link.
       */
      write(args: { uri: string | t.IRowUri; cell?: t.ICellData<any> | undefined }) {
        const uri = typeof args.uri === 'object' ? args.uri : Uri.parse<t.IRowUri>(args.uri);
        if (uri.type !== 'ROW') {
          const err = `The reference/link URI is not a ROW (given "${uri.toString()}")`;
          throw new Error(err);
        }

        const cell = { ...(args.cell || {}) };

        console.log('uri', uri);
        console.log('target', target);

        const linkKey = RefLinks.toKey('type');
        console.log('linkKey', linkKey);

        //

        // Finish up.
        cell.links = squash.object(cell);
        // cell.props = squash.props(cell.props);
        return squash.cell(cell) || {};
      },
    };
  }
}
