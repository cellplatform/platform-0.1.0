import { t } from './common';

export type CodeEditorEventsFactory = (bus: t.EventBus<t.CodeEditorEvent>) => CodeEditorEvents;

/**
 * API wrapper for event observables.
 */
export type CodeEditorEvents = {
  $: t.Observable<t.CodeEditorEvent>;
};
