// import { IDbActionGet } from '@platform/fs.db/lib/types';

/**
 * IPC Events
 */

export type IDbIpcGetEvent = {
  type: 'DB/get';
  payload: {
    dir: string;
    // action: IDbActionGet;
  };
};
