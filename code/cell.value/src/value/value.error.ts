import { t } from '../common';

/**
 * Assigns an error to the given parent.
 */
export function setError<T extends t.IErrorParent>(target: T, error?: t.IError): T {
  if (!error && !target.error) {
    return target;
  }
  const res = { ...target, error };
  if (!error) {
    delete res.error;
  }
  return res;
}
