import { t } from '../common';

/**
 * Func errors
 */
export type FuncError = IFuncError['type'];
export type IFuncError =
  | IFuncErrorNotFormula
  | IFuncErrorNotFound
  | IFuncErrorNotSupported
  | IFuncErrorInvoke
  | IFuncErrorCircularRef; // NB: Func execution can also result in a REF error.

type FuncErrorProps = { formula: string; path: string };
export type IFuncErrorNotFormula = t.IError<'FUNC/notFormula'> & FuncErrorProps;
export type IFuncErrorNotFound = t.IError<'FUNC/notFound'> & FuncErrorProps;

export type IFuncErrorNotSupported = IFuncErrorNotSupportedRange;
export type IFuncErrorNotSupportedRange = t.IError<'FUNC/notSupported/range'> & FuncErrorProps;

export type IFuncErrorInvoke = t.IError<'FUNC/invoke'> & FuncErrorProps;
export type IFuncErrorCircularRef = t.IError<'REF/circular'> & FuncErrorProps;
