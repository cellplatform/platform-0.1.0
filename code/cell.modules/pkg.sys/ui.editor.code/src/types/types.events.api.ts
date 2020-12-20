import { t } from './common';

export type CodeEditorEventBus = t.EventBus<t.CodeEditorEvent>;
export type CodeEditorEventsFactory = (bus: t.CodeEditorEventBus) => CodeEditorEvents;

/**
 * API wrapper for event observables.
 */
export type CodeEditorEvents = {
  $: t.Observable<t.CodeEditorEvent>;
};
