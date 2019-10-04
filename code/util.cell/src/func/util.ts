import { t } from '../common';
import { getCircularError } from '../refs/util';

export { getCircularError };
export { path, isFormula, toRefTarget, sort } from '../refs/util';

/**
 * Convert an object an `Error` with corresponding func/props.
 */
export const toError = (args: t.IFuncError): t.IFuncError => {
  const error = (new Error(args.message) as unknown) as t.IFuncError;
  error.cell = args.cell;
  error.type = args.type;
  return error;
};

/**
 * Convert an incoming `Error` to a simple `IFuncError` object.
 */
export const fromError = (
  err: any,
  options: { cell?: t.IFuncError['cell'] } = {},
): t.IFuncError => {
  if (err.type) {
    const { type, message, cell } = err as t.IFuncError;
    return { type, message, cell: cell || options.cell };
  } else {
    const error = err instanceof Error ? err : new Error(`Error object not provided.`);
    throw error;
  }
};

/**
 * If a CIRCULAR reference error exists throw it.
 */
export const throwIfCircular = (args: { cell: string; refs: t.IRefs }) => {
  const err = getCircularError(args.refs, args.cell);
  if (err) {
    throw err;
  }
};
