import { t } from '../common';

/**
 * URI errors
 */
type UriErrorProps = { uri: string };
export type IUriError = t.IError<'URI'> & UriErrorProps;
