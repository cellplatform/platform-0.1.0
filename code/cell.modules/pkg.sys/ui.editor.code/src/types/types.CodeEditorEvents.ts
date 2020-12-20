import { t } from './common';

type E = t.CodeEditorEvent;

export type CodeEditorEventBus = t.EventBus<E>;
export type CodeEditorEventsFactory = (
  bus: t.EventBus<any>,
  options?: CodeEditorEventsFactoryOptions,
) => CodeEditorEvents;
export type CodeEditorEventsFactoryOptions = {
  instance?: string;
};

/**
 * API wrapper for event observables.
 */
export type CodeEditorEvents = {
  $: t.Observable<E>;
  dispose$: t.Observable<void>;

  dispose(): void;
  fire<T extends E>(e: T): CodeEditorEvents;
};
