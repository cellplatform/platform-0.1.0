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

  http(path: string) {
    path = (path || '').trim();
    return path.startsWith('http://') || path.startsWith('https://');
  },

  editorEvent(e: t.Event) {
    return e.type.startsWith('sys.ui.code/');
  },

  instanceEvent(e: t.Event) {
    return Is.editorEvent(e) && typeof e.payload.instance === 'string';
  },

  singletonEvent(e: t.Event) {
    return Is.editorEvent(e) && e.payload.instance === undefined;
  },

  declarationFileUrl(url: string) {
    url = (url || '').trim();
    const start = url.split('?')[0].split('#')[0];
    return start.endsWith('.d.txt');
  },
};
