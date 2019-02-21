export * from '../types';

/**
 * [Events]
 */
export type DbEvent = IDbErrorEvent | IDbWatchEvent;
export type IDbWatchEvent<D extends object = any> = {
  type: 'DB/watch';
  payload: {
    key: keyof D;
    value?: D[keyof D];
    pattern: string | '*';
    deleted: boolean;
  };
};
export type IDbErrorEvent = {
  type: 'DB/error';
  payload: { error: Error };
};
