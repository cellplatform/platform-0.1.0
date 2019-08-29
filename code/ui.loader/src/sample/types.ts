import * as t from '../types';
export * from '../types';

export type IMyContext = t.ILoaderContext & {
  foo: string;
};
