import { Observable } from 'rxjs';

import * as t from '../common/types';

/**
 * Keeps a state object in sync with navigation changes.
 */
export type ITreeNavController = t.IDisposable &
  ITreeNavControllerProps & {
    event: t.ITreeNavControllerEvents;
    root: t.ITreeViewNode;
    change(args: ITreeNavControllerProps): ITreeNavController;
    patch(args: Partial<ITreeNavControllerProps>): ITreeNavController;
  };

/**
 * Nav properties
 */
export type ITreeNavControllerProps = {
  current?: string; // Node ID.
  selected?: string; // Node ID.
};

/**
 * Consolidated events for the controller.
 */
export type ITreeNavControllerEvents = {
  $: Observable<t.TreeNavEvent>;
  change$: Observable<t.ITreeNavControllerChange>;
  changed$: Observable<t.ITreeNavControllerChanged>;
  fire: t.FireEvent<t.TreeNavEvent>;
  payload<T extends t.TreeNavEvent>(type: T['type']): Observable<T['payload']>;
};

/**
 * Events
 */
export type TreeNavEvent = ITreeNavControllerChangeEvent | ITreeNavControllerChangedEvent;

/**
 * Fires to request a change to the navigation state.
 */
export type ITreeNavControllerChangeEvent = {
  type: 'TreeNav/change';
  payload: ITreeNavControllerChange;
};
export type ITreeNavControllerChange = { current?: string; selected?: string };

/**
 * Fires when the navigation state has changed.
 */
export type ITreeNavControllerChangedEvent = {
  type: 'TreeNav/changed';
  payload: ITreeNavControllerChanged;
};
export type ITreeNavControllerChanged = {
  current?: string;
  selected?: string;
  root: t.ITreeViewNode;
};
