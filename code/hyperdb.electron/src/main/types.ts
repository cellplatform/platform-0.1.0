import { ICreateDatabaseArgs } from '../types';
export * from '../types';

/**
 * [Events]
 */
export type MainDbEvent = IMainDbCreatingEvent | IMainDbCreatedEvent;

export type IMainDbCreatingEvent = {
  type: 'DB/main/creating';
  payload: ICreateDatabaseArgs;
};
export type IMainDbCreating = IMainDbCreated & {};

export type IMainDbCreatedEvent = {
  type: 'DB/main/created';
  payload: IMainDbCreated;
};
export type IMainDbCreated = {
  dir: string;
  dbKey: string;
  localKey: string;
  discoveryKey: string;
  version?: string; // "Checked-out-at" version.
};
