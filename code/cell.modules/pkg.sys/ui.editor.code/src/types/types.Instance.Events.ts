import { t } from './common';

type E = t.CodeEditorEvent;
type O<T> = t.Observable<T>;

export type CodeEditorEventBus = t.EventBus<E>;
export type CodeEditorEventsFactory = (
  bus: t.EventBus<any>,
  options?: CodeEditorEventsFactoryOptions,
) => CodeEditorEvents;
export type CodeEditorEventsFactoryOptions = {
  instance?: string;
};

/**
 * API wrapper for event observables.
 */
export type CodeEditorEvents = {
  readonly $: O<E>;
  readonly dispose$: O<void>;
  readonly focus$: O<t.ICodeEditorFocusChanged>;
  readonly blur$: O<t.ICodeEditorFocusChanged>;
  readonly selection$: O<t.ICodeEditorSelectionChanged>;
  readonly text$: O<t.ICodeEditorTextChanged>;
  fire(instance: string): CodeEditorEventsFire;
  dispose(): void;
};

/**
 * API for firing events that change the editor state.
 */
export type CodeEditorEventsFire = {
  readonly instance: string;
  focus(): void;
  text(text: string | null): void;
  action(action: t.MonacoAction): string; // Execution id ([tx] on event)
  select(
    selection: t.CodeEditorPosition | t.CodeEditorRange | t.CodeEditorRange[] | null,
    options?: { focus?: boolean },
  ): void;
};
