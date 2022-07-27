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
  readonly id: Id;
  readonly $: t.Observable<t.CodeEditorEvent>;
  readonly singleton$: t.Observable<t.CodeEditorSingletonEvent>;
  readonly instance$: t.Observable<t.CodeEditorInstanceEvent>;
  readonly libs: CodeEditorLibEvents;

  readonly status: {
    req$: t.Observable<t.CodeEditorStatusReq>;
    res$: t.Observable<t.CodeEditorStatusRes>;
    fire(options?: Options): Promise<t.CodeEditorStatusRes>;
    get(options?: Options): Promise<t.CodeEditorStatus | undefined>;
  };

  readonly init: {
    req$: t.Observable<t.CodeEditorInitReq>;
    res$: t.Observable<t.CodeEditorInitRes>;
    fire(args: { staticRoot?: string } & Options): Promise<t.CodeEditorInitRes>;
  };

  editor(id: string): t.CodeEditorInstanceEvents;
};

export type CodeEditorLibEvents = {
  load: {
    req$: t.Observable<t.CodeEditorLibsLoadReq>;
    res$: t.Observable<t.CodeEditorLibsLoadRes>;
    fire(url: string, options?: Options): Promise<t.CodeEditorLibsLoadRes>;
  };

  clear: {
    req$: t.Observable<t.CodeEditorLibsClearReq>;
    res$: t.Observable<t.CodeEditorLibsClearRes>;
    fire(options?: Options): Promise<t.CodeEditorLibsClearRes>;
  };
};
