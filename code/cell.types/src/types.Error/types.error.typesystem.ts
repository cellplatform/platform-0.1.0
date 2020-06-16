import { t } from '../common';

/**
 * TypeSystem errors
 */
export type TypeError = ITypeError['type'];
export type ITypeError =
  | ITypeErrorDef
  | ITypeErrorDefInvalid
  | ITypeErrorNotFound
  | ITypeErrorTarget
  | ITypeErrorRef
  | ITypeErrorCircularRef
  | ITypeErrorRefTypename
  | ITypeErrorDuplicateProp
  | ITypeErrorDuplicateTypename
  | ITypeErrorSheet;

type TypeErrorProps = { ns: string; column?: string };
export type ITypeErrorDef = t.IError<'TYPE/def'> & TypeErrorProps;
export type ITypeErrorDefInvalid = t.IError<'TYPE/def/invalid'> & TypeErrorProps;
export type ITypeErrorNotFound = t.IError<'TYPE/notFound'> & TypeErrorProps;
export type ITypeErrorTarget = t.IError<'TYPE/target'> & TypeErrorProps;
export type ITypeErrorRef = t.IError<'TYPE/ref'> & TypeErrorProps;
export type ITypeErrorCircularRef = t.IError<'TYPE/ref/circular'> & TypeErrorProps;
export type ITypeErrorRefTypename = t.IError<'TYPE/ref/typename'> & TypeErrorProps;
export type ITypeErrorDuplicateProp = t.IError<'TYPE/duplicate/prop'> & TypeErrorProps;
export type ITypeErrorDuplicateTypename = t.IError<'TYPE/duplicate/typename'> & TypeErrorProps;
export type ITypeErrorSheet = t.IError<'TYPE/sheet'> & TypeErrorProps;
