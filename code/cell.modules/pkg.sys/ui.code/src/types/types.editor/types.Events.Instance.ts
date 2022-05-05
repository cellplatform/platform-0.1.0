import { t } from './common';

type Milliseconds = number;
type Id = string;
type Observable<T> = t.Observable<T>;
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
  $: Observable<t.CodeEditorInstanceEvent>;
  dispose$: Observable<void>;
  dispose(): void;

  focus: {
    changed$: Observable<t.CodeEditorFocusChanged>;
    fire(): void;
  };

  blur: {
    changed$: Observable<t.CodeEditorFocusChanged>;
  };

  selection: {
    changed$: Observable<t.CodeEditorSelectionChanged>;
    select(
      selection: t.CodeEditorPosition | t.CodeEditorRange | t.CodeEditorRange[] | null,
      options?: { focus?: boolean },
    ): void;
  };

  text: {
    changed$: Observable<t.CodeEditorTextChanged>;
    set(text: string | null): void;
    get: {
      req$: Observable<t.CodeEditorTextReq>;
      res$: Observable<t.CodeEditorTextRes>;
      fire(options?: { timeout?: Milliseconds }): Promise<string>;
    };
  };

  model: {
    req$: Observable<t.CodeEditorModelReq>;
    res$: Observable<t.CodeEditorModelRes>;
    get(options?: Options): Promise<t.CodeEditorModel>;
    set: {
      language(value: t.CodeEditorLanguage, options?: Options): Promise<t.CodeEditorModel>;
      fire(change?: Partial<t.CodeEditorModel>, options?: Options): Promise<t.CodeEditorModel>;
    };
  };

  action: {
    run$: Observable<t.CodeEditorRunAction>;
    fire(action: t.MonacoAction): Promise<t.CodeEditorActionComplete>;
  };
};
