import { R } from './libs';

export const compact = <T>(value: T[]) =>
  R.pipe(
    R.reject(R.isNil),
    R.reject(R.isEmpty),
  )(value) as T[];
