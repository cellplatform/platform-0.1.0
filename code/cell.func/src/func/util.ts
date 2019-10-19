import { t, coord } from '../common';

const refs = coord.refs;
export const path = refs.path;
export const isFormula = refs.isFormula;
export const sort = refs.sort;
export const toRefTarget = refs.toRefTarget;
export const getCircularError = refs.getCircularError;

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
