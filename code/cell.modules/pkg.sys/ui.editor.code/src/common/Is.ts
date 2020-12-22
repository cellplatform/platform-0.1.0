import * as t from './types';

/**
 * Flag helpers.
 */
export const Is = {
  position(input: any): boolean {
    if (input === null || typeof input !== 'object') return false;
    const value = input as t.CodeEditorPosition;
    return typeof value.column === 'number' && typeof value.line === 'number';
  },

  range(input: any): boolean {
    if (input === null || typeof input !== 'object') return false;
    const value = input as t.CodeEditorRange;
    return Is.position(value.start) && Is.position(value.end);
  },

  selection(input: any): boolean {
    if (input === null || typeof input !== 'object') return false;
    const value = input as t.CodeEditorSelection;
    return (
      Is.position(value.cursor) &&
      Is.range(value.primary) &&
      Array.isArray(value.secondary) &&
      value.secondary.every((range) => Is.range(range))
    );
  },

  editorEvent(e: t.Event) {
    return e.type.startsWith('CodeEditor/');
  },

  instanceEvent(e: t.Event) {
    return Is.editorEvent(e) && typeof e.payload.instance === 'string';
  },

  singletonEvent(e: t.Event) {
    return Is.editorEvent(e) && e.payload.instance === undefined;
  },
};
