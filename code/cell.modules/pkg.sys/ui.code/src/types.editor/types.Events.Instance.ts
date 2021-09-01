import { t } from './common';

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
    changed$: O<t.ICodeEditorFocusChanged>;
    fire(): void;
  };

  readonly blur: {
    changed$: O<t.ICodeEditorFocusChanged>;
  };

  readonly selection: {
    changed$: O<t.ICodeEditorSelectionChanged>;
    select(
      selection: t.CodeEditorPosition | t.CodeEditorRange | t.CodeEditorRange[] | null,
      options?: { focus?: boolean },
    ): void;
  };

  readonly text: {
    changed$: O<t.ICodeEditorTextChanged>;
    set(text: string | null): void;
  };

  readonly action: {
    run$: O<t.ICodeEditorRunAction>;
    fire(action: t.MonacoAction): Promise<t.ICodeEditorActionComplete>;
  };
};
