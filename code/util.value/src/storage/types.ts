import * as t from '../types';

export type ILocalStorageProps<P = any> = Record<keyof P, P[keyof P]>;

export type ILocalStorage<P extends ILocalStorageProps<P>> = ILocalStorageProps<P> & {
  delete(key: keyof P): ILocalStorage<P>;
};

export type ILocalStorageProvider = {
  get(key: string): t.Json | undefined;
  set(key: string, value: t.Json): t.Json | undefined;
  delete(key: string): void;
};
