import { t } from './common';

type O<T> = t.Observable<T>;

export type CodeEditorEventsFactory = (bus: t.EventBus<any>) => t.CodeEditorEvents;

/**
 * API wrapper for event observables.
 */
export type CodeEditorEvents = {
  readonly dispose$: O<void>;
  readonly $: O<t.CodeEditorEvent>;
  readonly singleton$: O<t.CodeEditorSingletonEvent>;
  readonly instance$: O<t.CodeEditorInstanceEvent>;
  readonly fire: t.CodeEditorEventsFire;
  dispose(): void;
};

/**
 * API for firing global events.
 */
export type CodeEditorEventsFire = {
  //
};
