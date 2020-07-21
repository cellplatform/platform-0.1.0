import { Observable } from 'rxjs';

import * as t from '../common/types';

/**
 * Keeps a state object in sync with navigation changes.
 */
export type ITreeNavController = t.IDisposable &
  ITreeNavControllerState & {
    events: t.ITreeNavControllerEvents;
  };

export type ITreeNavControllerState = {
  current?: string; // Node ID.
};

export type ITreeNavControllerEvents = {
  event$: Observable<t.TreeNavEvent>;
  changed$: Observable<t.ITreeNavControllerChanged>;
  fire: t.FireEvent<t.TreeNavEvent>;
  payload<T extends t.TreeNavEvent>(type: T['type']): Observable<T['payload']>;
};

/**
 * Events
 */
export type TreeNavEvent = ITreeNavControllerChangedEvent;

export type ITreeNavControllerChangedEvent = {
  type: 'TreeNav/changed';
  payload: ITreeNavControllerChanged;
};
export type ITreeNavControllerChanged = { currrent: string };
