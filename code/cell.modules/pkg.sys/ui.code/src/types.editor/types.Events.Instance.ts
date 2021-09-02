import { t } from './common';

type Milliseconds = number;
type InstanceId = string;
type Observable<T> = t.Observable<T>;
type Options = { timeout?: Milliseconds };

export type CodeEditorInstanceEventsFactory = (args: {
  bus: t.EventBus<any>;
  id: InstanceId;
}) => t.CodeEditorInstanceEvents;

/**
 * API wrapper for event observables.
 */
export type CodeEditorInstanceEvents = {
  readonly id: InstanceId;
  readonly $: Observable<t.CodeEditorInstanceEvent>;
  readonly dispose$: Observable<void>;
  dispose(): void;

  readonly focus: {
    changed$: Observable<t.CodeEditorFocusChanged>;
    fire(): void;
  };

  readonly blur: {
    changed$: Observable<t.CodeEditorFocusChanged>;
  };

  readonly selection: {
    changed$: Observable<t.CodeEditorSelectionChanged>;
    select(
      selection: t.CodeEditorPosition | t.CodeEditorRange | t.CodeEditorRange[] | null,
      options?: { focus?: boolean },
    ): void;
  };

  readonly text: {
    changed$: Observable<t.CodeEditorTextChanged>;
    set(text: string | null): void;
    get: {
      req$: Observable<t.CodeEditorTextReq>;
      res$: Observable<t.CodeEditorTextRes>;
      fire(options?: { timeout?: Milliseconds }): Promise<string>;
    };
  };

  readonly model: {
    req$: Observable<t.CodeEditorModelReq>;
    res$: Observable<t.CodeEditorModelRes>;
    get(options?: Options): Promise<t.CodeEditorModel>;
    set: {
      language(value: t.CodeEditorLanguage, options?: Options): Promise<t.CodeEditorModel>;
      fire(change?: Partial<t.CodeEditorModel>, options?: Options): Promise<t.CodeEditorModel>;
    };
  };

  readonly action: {
    run$: Observable<t.CodeEditorRunAction>;
    fire(action: t.MonacoAction): Promise<t.CodeEditorActionComplete>;
  };
};
