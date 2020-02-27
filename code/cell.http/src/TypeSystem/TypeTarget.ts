import { t, ERROR } from './common';

type Input = t.CellTypeTarget | t.ITypeDef;
const asTarget = (input?: Input) => {
  return ((typeof input === 'object' ? input.target : input) || '').trim() || 'inline';
};

/**
 * Parser for interpreting a target reference for a ITypeDef.
 *
 * Formats:
 *      - "inline"                  => { value }
 *      - "inline:<prop>"           => { props: { 'prop': {...} } }
 *      - "inline:<propA>.<propB>"  => { props: { 'propA.propB1: {...} } }
 *      - ref => external (save to prop: ref:props, or link(?))
 *
 */
export class TypeTarget {
  /**
   * Parses a cell target into its constituent parts.
   */
  public static cell(input?: Input): t.CellTypeTargetInfo {
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
  public static readInline<T extends any>(args: { type: t.ITypeDef; data: t.ICellData }) {
    const { data } = args;
    const target = TypeTarget.cell(args.type);

    if (!target.isValid) {
      throw new Error(`The target '${target}' is not valid.`);
    }
    if (!target.isInline) {
      throw new Error(`The target '${target}' is not 'inline'.`);
    }

    const path = target.path;
    if (path === 'value') {
      return data.value as T;
    }
    if (path.startsWith('props:')) {
      const field = path.substring('props:'.length);
      return (data.props || {})[field] as T;
    }
    return;

    // TODO 🐷
  }

  /**
   * Writes the target property to the given cell.
   */
  public static writeInline(args: {}) {
    // TODO 🐷
  }
}
