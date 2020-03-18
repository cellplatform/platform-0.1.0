import { expect, t } from '../test';
import * as util from './util';

describe('util', () => {
  it('getHeader', () => {
    const test = (key: string, headers: t.IHttpHeaders | undefined, expected: any) => {
      const res = util.getHeader(key, headers);
      expect(res).to.eql(expected);
    };

    test('foo', undefined, '');
    test('foo', {}, '');

    test('content-type', { 'content-type': 'text/plain' }, 'text/plain');
    test('content-type', { 'Content-Type': 'text/plain' }, 'text/plain');
    test('  content-type  ', { 'Content-Type': 'text/plain' }, 'text/plain');
    test('content-type', { '  Content-Type  ': 'text/plain' }, 'text/plain');
  });

  it('isFormData', () => {
    const test = (headers: t.IHttpHeaders | undefined, expected: boolean) => {
      const res = util.isFormData(headers);
      expect(res).to.eql(expected);
    };
    test(undefined, false);
    test({}, false);
    test({ foo: 'hello' }, false);
    test({ 'content-type': 'multipart/form-data' }, true);
    test({ ' Content-Type ': '  multipart/form-data  ' }, true);
  });
});
