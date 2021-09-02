import { t } from './common';

type Milliseconds = number;
type InstanceId = string;
type O<T> = t.Observable<T>;

export type CodeEditorInstanceEventsFactory = (args: {
  bus: t.EventBus<any>;
  id: InstanceId;
}) => t.CodeEditorInstanceEvents;

/**
 * API wrapper for event observables.
 */
export type CodeEditorInstanceEvents = {
  readonly id: InstanceId;
  readonly $: O<t.CodeEditorInstanceEvent>;
  readonly dispose$: O<void>;
  dispose(): void;

  readonly focus: {
    changed$: O<t.CodeEditorFocusChanged>;
    fire(): void;
  };

  readonly blur: {
    changed$: O<t.CodeEditorFocusChanged>;
  };

  readonly selection: {
    changed$: O<t.CodeEditorSelectionChanged>;
    select(
      selection: t.CodeEditorPosition | t.CodeEditorRange | t.CodeEditorRange[] | null,
      options?: { focus?: boolean },
    ): void;
  };

  readonly text: {
    changed$: O<t.CodeEditorTextChanged>;
    set(text: string | null): void;
    get: {
      req$: O<t.CodeEditorTextReq>;
      res$: O<t.CodeEditorTextRes>;
      fire(options?: { timeout?: Milliseconds }): Promise<string>;
    };
  };

  readonly action: {
    run$: O<t.CodeEditorRunAction>;
    fire(action: t.MonacoAction): Promise<t.CodeEditorActionComplete>;
  };
};
