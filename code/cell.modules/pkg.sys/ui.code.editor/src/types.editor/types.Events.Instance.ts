import { t } from './common';

type O<T> = t.Observable<T>;

export type CodeEditorInstanceEventsFactory = (
  bus: t.EventBus<any>,
  instance: string, // ID.
) => t.CodeEditorInstanceEvents;

/**
 * API wrapper for event observables.
 */
export type CodeEditorInstanceEvents = {
  readonly id: string;
  readonly dispose$: O<void>;
  readonly $: O<t.CodeEditorInstanceEvent>;
  readonly focus$: O<t.ICodeEditorFocusChanged>;
  readonly blur$: O<t.ICodeEditorFocusChanged>;
  readonly selection$: O<t.ICodeEditorSelectionChanged>;
  readonly text$: O<t.ICodeEditorTextChanged>;
  readonly fire: t.CodeEditorInstanceEventsFire;
  dispose(): void;
};

/**
 * API for firing events that change the editor state.
 */
export type CodeEditorInstanceEventsFire = {
  readonly instance: string;
  focus(): void;
  text(text: string | null): void;
  action(action: t.MonacoAction): Promise<t.ICodeEditorActionComplete>;
  select(
    selection: t.CodeEditorPosition | t.CodeEditorRange | t.CodeEditorRange[] | null,
    options?: { focus?: boolean },
  ): void;
};
