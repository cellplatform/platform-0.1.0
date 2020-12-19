import { t } from '../common';

/**
 * Helpers for working with code editor event observables.
 */
export const CodeEditorEvents: t.CodeEditorEventsFactory = (bus) => {
  return {
    $: bus.event$,
  };
};
