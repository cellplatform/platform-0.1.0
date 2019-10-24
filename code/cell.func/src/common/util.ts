import { coord } from './libs';
import * as t from './types';

export { value } from './libs';

const refs = coord.refs;
export const path = refs.path;
export const isFormula = refs.isFormula;
export const sort = refs.sort;
export const toRefTarget = refs.toRefTarget;
export const getCircularError = refs.getCircularError;

/**
 * Convert an object `Error` with corresponding func/props.
 */
export const toErrorObject = (input: t.IFuncError): t.IFuncError => {
  const error = (new Error(input.message) as unknown) as t.IFuncError;
  error.type = input.type;
  error.path = input.path;
  error.formula = input.formula;
  return error;
};

/**
 * Convert an incoming `Error` to a simple `IFuncError` object.
 */
export const fromErrorObject = (
  err: any,
  options: { path?: t.IFuncError['path']; formula?: t.IFuncError['formula'] } = {},
): t.IFuncError => {
  if (err.type) {
    const { type, message, path, formula } = err as t.IFuncError;
    const res = {
      type,
      message,
      path: path || options.path || '',
      formula: formula || options.formula || '',
    };
    return res as t.IFuncError;
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
