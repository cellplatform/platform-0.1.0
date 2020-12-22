import { expect, t } from '../test';
import { Is } from './Is';

describe('Is', () => {
  it('Is.position', () => {
    const test = (input: any, expected: boolean) => {
      expect(Is.position(input)).to.eql(expected);
    };
    test(undefined, false);
    test(123, false);
    test([123], false);
    test('hello', false);
    test(null, false);
    test({}, false);

    test({ column: 1, line: 1 }, true);
  });

  it('Is.range', () => {
    const test = (input: any, expected: boolean) => {
      expect(Is.range(input)).to.eql(expected);
    };
    test(undefined, false);
    test(123, false);
    test([123], false);
    test('hello', false);
    test(null, false);
    test({}, false);

    const pos: t.CodeEditorPosition = { column: 1, line: 1 };

    test({ start: pos, end: pos }, true);
    test({ end: pos }, false);
    test({ start: pos }, false);

    test({ start: pos, end: 123 }, false);
    test({ start: {}, end: pos }, false);
  });

  it('Is.selection', () => {
    const test = (input: any, expected: boolean) => {
      expect(Is.selection(input)).to.eql(expected);
    };
    test(undefined, false);
    test(123, false);
    test([123], false);
    test('hello', false);
    test(null, false);
    test({}, false);

    const pos: t.CodeEditorPosition = { column: 1, line: 1 };
    const range: t.CodeEditorRange = { start: pos, end: pos };

    test({ cursor: pos, primary: range, secondary: [] }, true);
    test({ cursor: pos, primary: range, secondary: [range, range] }, true);

    test({ cursor: 123, primary: range, secondary: [] }, false);
    test({ cursor: pos, primary: 123, secondary: [] }, false);
    test({ cursor: pos, primary: range, secondary: [123] }, false);
  });

  it('Is.http', () => {
    const test = (input: string, expected: boolean) => {
      expect(Is.http(input)).to.eql(expected);
    };

    test('', false);
    test('foo', false);
    test('  http  ', false);

    test('  http://  ', true);
    test('  https://domain.com  ', true);
  });

  it('Is.editorEvent', () => {
    const test = (input: t.Event<any>, expected: boolean) => {
      expect(Is.editorEvent(input)).to.eql(expected);
    };
    test({ type: 'CodeEditor/foo', payload: { instance: 'foo' } }, true);
    test({ type: 'foo', payload: { instance: 'foo' } }, false);
  });

  it('Is.editorEvent', () => {
    const test = (input: t.Event<any>, expected: boolean) => {
      expect(Is.editorEvent(input)).to.eql(expected);
    };
    test({ type: 'CodeEditor/foo', payload: { instance: 'foo' } }, true);
    test({ type: 'foo', payload: { instance: 'foo' } }, false);
  });

  it('Is.instanceEvent', () => {
    const test = (input: t.Event<any>, expected: boolean) => {
      expect(Is.instanceEvent(input)).to.eql(expected);
    };
    test({ type: 'CodeEditor/foo', payload: { instance: 'foo' } }, true);
    test({ type: 'CodeEditor/foo', payload: {} }, false);
    test({ type: 'foo', payload: { instance: 'foo' } }, false);
  });

  it('Is.singletonEvent', () => {
    const test = (input: t.Event<any>, expected: boolean) => {
      expect(Is.singletonEvent(input)).to.eql(expected);
    };
    test({ type: 'foo', payload: {} }, false);
    test({ type: 'CodeEditor/foo', payload: { instance: 'foo' } }, false);
    test({ type: 'CodeEditor/foo', payload: {} }, true);
  });
});
