import { t } from '../common';

/**
 * Func errors.
 */
export type RuntimeError = 'RUNTIME/pull' | 'RUNTIME/run';
export type IRuntimeError<E extends RuntimeError = RuntimeError> = t.IError<E> & {
  bundle: t.RuntimeBundleOrigin | t.RuntimeBundleOrigin2;
};
