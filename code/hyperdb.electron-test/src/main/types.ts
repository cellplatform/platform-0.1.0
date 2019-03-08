export * from '../types';

/**
 * [Events]
 */
export type MainDbEvent = IMainDbCreatedEvent;

export type IMainDbCreatedEvent = {
  type: 'DB/main/created';
  payload: {
    dir: string;
    dbKey: string;
    localKey: string;
    discoveryKey: string;
    version?: string; // "Checked-out-at" version.
  };
};
