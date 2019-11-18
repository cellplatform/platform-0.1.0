import { pipe, reject, isNil, isEmpty } from 'ramda';

export const compact = <T>(value: T[]) => pipe(reject(isNil), reject(isEmpty))(value) as T[];
