import { t } from './common';

export type CodeEditorEventsFactory = (
  bus: t.EventBus<any>,
  options?: { dispose?: t.Observable<any> },
) => t.CodeEditorEvents;

/**
 * API wrapper for event observables.
 */
export type CodeEditorEvents = t.Disposable & {
  readonly $: t.Observable<t.CodeEditorEvent>;
  readonly singleton$: t.Observable<t.CodeEditorSingletonEvent>;
  readonly instance$: t.Observable<t.CodeEditorInstanceEvent>;

  editor(id: string): t.CodeEditorInstanceEvents;

  readonly libs: {
    clear(): void;
    load(url: string): Promise<t.CodeEditorLibsLoaded>;
  };
};
