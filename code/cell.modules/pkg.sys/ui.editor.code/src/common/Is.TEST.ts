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
});
