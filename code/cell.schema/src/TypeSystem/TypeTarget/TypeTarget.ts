import { t, ERROR, value as valueUtil, squash } from '../common';

type Input = t.CellTypeTarget | t.IColumnTypeDef;
const asTarget = (input?: Input) => {
  return ((typeof input === 'object' ? input.target : input) || '').trim() || 'inline';
};

/**
 * Parser for interpreting a [target] reference within an [ITypeDef].
 *
 * Formats:
 *      - "inline"                  => { value }
 *      - "inline:<prop>"           => { props: { 'prop': {...} } }
 *      - "inline:<propA>.<propB>"  => { props: { 'propA.propB1': {...} } }
 *      - "inline:<propA>:<propB>"  => { props: { 'propA:propB1': {...} } }
 *
 *      - ref => external (save to prop: ref:props, or link(?))
 *
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
      path = 'ref:type';
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
      toString() {
        return target;
      },
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
   * Reads the target property from the given cell.
   */
  public static read(type: t.IColumnTypeDef) {
    const target = TypeTarget.parse(type);
    return {
      /**
       * Reads inline values.
       */
      inline<V extends any>(cell: t.ICellData<any>) {
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
    };
  }

  /**
   * Writes the target property to the given cell.
   */
  public static write(type: t.IColumnTypeDef) {
    const target = TypeTarget.parse(type);
    return {
      /**
       * Write inline balues
       */
      inline<V extends any>(args: { data: V | undefined; cell?: t.ICellData<any> | undefined }) {
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
}
