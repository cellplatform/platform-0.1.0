import { t } from './common';

type O<T> = t.Observable<T>;

export type CodeEditorSingletonEventsFactory = (
  bus: t.EventBus<any>,
) => t.CodeEditorSingletonEvents;

/**
 * API wrapper for event observables.
 */
export type CodeEditorSingletonEvents = {
  readonly dispose$: O<void>;
  readonly $: O<t.CodeEditorEvent>;
  readonly singleton$: O<t.CodeEditorSingletonEvent>;
  readonly instance$: O<t.CodeEditorInstanceEvent>;
  readonly fire: t.CodeEditorSingletonEventsFire;
  dispose(): void;
};

/**
 * API for firing global events.
 */
export type CodeEditorSingletonEventsFire = {
  //
};
