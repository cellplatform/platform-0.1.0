import { t } from '../common';

/**
 * Ref errors
 */
export type RefError = IRefError['type'];
export type IRefError = IRefErrorCircular | IRefErrorName;

type RefErrorProps = { path: string };
export type IRefErrorCircular = t.IError<'REF/circular'> & RefErrorProps;
export type IRefErrorName = t.IError<'REF/name'> & RefErrorProps;
