import { t } from '../common';
import { expect, Test } from '../test';
import { Is } from './Is';

export default Test.describe('Common: Is (flags)', (e) => {
  e.it('Is.position', () => {
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

  e.it('Is.range', () => {
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

  e.it('Is.selection', () => {
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

  e.it('Is.http', () => {
    const test = (input: string, expected: boolean) => {
      expect(Is.http(input)).to.eql(expected);
    };

    test('', false);
    test('foo', false);
    test('  http  ', false);

    test('  http://  ', true);
    test('  https://domain.com  ', true);
  });

  e.it('Is.editorEvent', () => {
    const test = (input: t.Event<any>, expected: boolean) => {
      expect(Is.editorEvent(input)).to.eql(expected);
    };
    test({ type: 'sys.ui.code/foo', payload: { instance: 'foo' } }, true);
    test({ type: 'foo', payload: { instance: 'foo' } }, false);
  });

  e.it('Is.editorEvent', () => {
    const test = (input: t.Event<any>, expected: boolean) => {
      expect(Is.editorEvent(input)).to.eql(expected);
    };
    test({ type: 'sys.ui.code/foo', payload: { instance: 'foo' } }, true);
    test({ type: 'foo', payload: { instance: 'foo' } }, false);
  });

  e.it('Is.instanceEvent', () => {
    const test = (input: t.Event<any>, expected: boolean) => {
      expect(Is.instanceEvent(input)).to.eql(expected);
    };
    test({ type: 'sys.ui.code/foo', payload: { instance: 'foo' } }, true);
    test({ type: 'sys.ui.code/foo', payload: {} }, false);
    test({ type: 'foo', payload: { instance: 'foo' } }, false);
  });

  e.it('Is.singletonEvent', () => {
    const test = (input: t.Event<any>, expected: boolean) => {
      expect(Is.singletonEvent(input)).to.eql(expected);
    };
    test({ type: 'foo', payload: {} }, false);
    test({ type: 'sys.ui.code/foo', payload: { instance: 'foo' } }, false);
    test({ type: 'sys.ui.code/foo', payload: {} }, true);
  });

  e.it('Is.declarationFileUrl', () => {
    const test = (input: string, expected: boolean) => {
      expect(Is.declarationFileUrl(input)).to.eql(expected);
    };
    test(undefined as any, false);
    test('', false);
    test('  ', false);
    test('http://localhost/static/types.d/lib.es', false);

    test('http://localhost/static/types.d/foo.d.txt', true);
    test('http://localhost/static/types.d/foo.d.txt#foo', true);
    test('http://localhost/static/types.d/foo.d.txt?foo', true);
    test('   http://localhost/static/types.d/foo.d.txt?foo#bar  ', true);
    test('types.d/foo.d.txt', true);
  });
});
