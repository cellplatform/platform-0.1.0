import * as t from '../types';
export * from '@platform/graphql/lib/types';
export * from '../types';

/**
 * [Events]
 */
export type ThreadDataEvent = IThreadSavingEvent | IThreadSavedEvent;

export type IThreadSavingEvent = {
  type: 'THREAD:DATA/saving';
  payload: {
    thread: t.IThreadModel;
    isCancelled: boolean;
    cancel(): void;
  };
};
export type IThreadSavedEvent = {
  type: 'THREAD:DATA/saved';
  payload: { thread: t.IThreadModel };
};
