import { t } from './common';

type E = t.CodeEditorEvent;

export type CodeEditorEventBus = t.EventBus<E>;
export type CodeEditorEventsFactory = (bus: t.EventBus<any> | t.Subject<any>) => CodeEditorEvents;

/**
 * API wrapper for event observables.
 */
export type CodeEditorEvents = {
  $: t.Observable<E>;
  editor$: t.Observable<t.CodeEditorComponentEvent>;
  fire<T extends E>(e: T): CodeEditorEvents;
};
