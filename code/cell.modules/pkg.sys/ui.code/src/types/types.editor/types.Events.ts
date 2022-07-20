import { t } from './common';

type Id = string;
type Milliseconds = number;
type Options = { timeout?: Milliseconds };

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
  readonly libs: CodeEditorLibEvents;
  editor(id: string): t.CodeEditorInstanceEvents;
};

export type CodeEditorLibEvents = {
  load: {
    req$: t.Observable<t.CodeEditorLibsLoadReq>;
    res$: t.Observable<t.CodeEditorLibsLoadRes>;
    fire(url: string, options?: Options): Promise<t.CodeEditorLibsLoadRes>;
  };

  clear(): void;
};
