import { t } from './common';

export type MonacoEvent = IMonacoContentChangedEvent;

/**
 * Fired when the code editor content has changed.
 */
export type IMonacoContentChangedEvent = {
  type: 'Monaco/contentChanged';
  payload: IMonacoContentChanged;
};
export type IMonacoContentChanged = t.IMonacoModelContentChangedEvent & {
  instance: string;
};
