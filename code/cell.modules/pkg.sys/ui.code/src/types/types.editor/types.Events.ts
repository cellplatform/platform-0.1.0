import { t } from './common';

type O<T> = t.Observable<T>;

export type CodeEditorEventsFactory = (bus: t.EventBus<any>) => t.CodeEditorEvents;

/**
 * API wrapper for event observables.
 */
export type CodeEditorEvents = {
  readonly $: O<t.CodeEditorEvent>;
  readonly singleton$: O<t.CodeEditorSingletonEvent>;
  readonly instance$: O<t.CodeEditorInstanceEvent>;

  readonly dispose$: O<void>;
  dispose(): void;

  editor(id: string): t.CodeEditorInstanceEvents;

  readonly libs: {
    clear(): void;
    load(url: string): Promise<t.CodeEditorLibsLoaded>;
  };
};
