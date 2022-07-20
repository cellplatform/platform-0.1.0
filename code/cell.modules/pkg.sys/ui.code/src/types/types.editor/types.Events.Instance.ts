import { t } from './common';

type Id = string;
type Milliseconds = number;
type Options = { timeout?: Milliseconds };

export type CodeEditorInstanceEventsFactory = (args: {
  bus: t.EventBus<any>;
  id: Id;
  dispose$?: t.Observable<any>;
}) => t.CodeEditorInstanceEvents;

/**
 * API wrapper for event observables.
 */
export type CodeEditorInstanceEvents = {
  instance: { bus: Id; id: Id };
  $: t.Observable<t.CodeEditorInstanceEvent>;
  dispose$: t.Observable<void>;
  dispose(): void;

  focus: {
    changed$: t.Observable<t.CodeEditorFocusChanged>;
    fire(): void;
  };

  blur: {
    changed$: t.Observable<t.CodeEditorFocusChanged>;
  };

  selection: {
    changed$: t.Observable<t.CodeEditorSelectionChanged>;
    select(
      selection: t.CodeEditorPosition | t.CodeEditorRange | t.CodeEditorRange[] | null,
      options?: { focus?: boolean },
    ): void;
  };

  text: {
    changed$: t.Observable<t.CodeEditorTextChanged>;
    set(text: string | null): void;
    get: {
      req$: t.Observable<t.CodeEditorTextReq>;
      res$: t.Observable<t.CodeEditorTextRes>;
      fire(options?: Options): Promise<string>;
    };
  };

  model: {
    req$: t.Observable<t.CodeEditorModelReq>;
    res$: t.Observable<t.CodeEditorModelRes>;
    get(options?: Options): Promise<t.CodeEditorModel>;
    set: {
      language(value: t.CodeEditorLanguage, options?: Options): Promise<t.CodeEditorModel>;
      fire(change?: Partial<t.CodeEditorModel>, options?: Options): Promise<t.CodeEditorModel>;
    };
  };

  action: {
    req$: t.Observable<t.CodeEditorRunActionReq>;
    res$: t.Observable<t.CodeEditorRunActionRes>;
    fire(action: t.MonacoAction, options?: Options): Promise<t.CodeEditorRunActionRes>;
  };
};
