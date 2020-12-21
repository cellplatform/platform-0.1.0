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
  fire(instance: string): CodeEditorEventsFire;
  dispose(): void;
};

/**
 * API for firing events that change the editor state.
 */
export type CodeEditorEventsFire = {
  readonly instance: string;
  focus(): void;
  select(
    selection: t.CodeEditorPosition | t.CodeEditorRange | t.CodeEditorRange[] | null,
    options?: { focus?: boolean },
  ): void;
};
