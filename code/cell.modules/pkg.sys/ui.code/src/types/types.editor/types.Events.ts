import { t } from './common';

type Id = string;
type Milliseconds = number;
type Options = { timeout?: Milliseconds };

export type CodeEditorEventsFactory = (
  bus: t.EventBus<any>,
  options?: { dispose$?: t.Observable<any> },
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
    req$: t.Observable<t.CodeEditorGlobalStatusReq>;
    res$: t.Observable<t.CodeEditorGlobalStatusRes>;
    fire(options?: Options): Promise<t.CodeEditorGlobalStatusRes>;
    get(options?: Options): Promise<t.CodeEditorStatus | undefined>;

    updated$: t.Observable<t.CodeEditorGlobalStatusUpdated>;
    updated(payload: t.CodeEditorGlobalStatusUpdated): Promise<void>;

    instance: {
      update$: t.Observable<t.CodeEditorStatusUpdate>;
      fire(payload: t.CodeEditorStatusUpdate): Promise<void>;
    };
  };

  readonly init: {
    req$: t.Observable<t.CodeEditorGlobalInitReq>;
    res$: t.Observable<t.CodeEditorGlobalInitRes>;
    fire(args: { staticRoot?: string } & Options): Promise<t.CodeEditorGlobalInitRes>;
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
