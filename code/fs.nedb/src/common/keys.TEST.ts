import { expect } from 'chai';
import * as keys from './keys';

describe('keys', () => {
  it('encodeKey => decodeKey', () => {
    const test = (input: string, output: string) => {
      const res = {
        encoded: keys.encodeKey(input),
        decoded: keys.decodeKey(keys.encodeKey(input)),
      };
      expect(res.encoded).to.eql(output);
      expect(res.decoded).to.eql(input);
    };

    test('foo', 'foo');
    test('.foo', '\\foo');
    test('.foo.', '\\foo\\');
    test('foo.bar', 'foo\\bar');
    test('foo.bar.baz', 'foo\\bar\\baz');
  });

  it('encodeObjectKeys => decodeObjectKeys', () => {
    const test = (input: object, output: object) => {
      const res = {
        encoded: keys.encodeObjectKeys(input),
        decoded: keys.decodeObjectKeys(keys.encodeObjectKeys(input)),
      };
      expect(res.encoded).to.eql(output);
      expect(res.decoded).to.eql(input);
    };

    test(null, null);
    test({ foo: 123 }, { foo: 123 });
    test([{ foo: 123 }], [{ foo: 123 }]);
    test({ 'foo.bar': 123 }, { 'foo\\bar': 123 });
    test({ 'foo.bar': null, msg: 'hello' }, { 'foo\\bar': null, msg: 'hello' });
    test({ foo: { 'bar.boo': true } }, { foo: { 'bar\\boo': true } });
    test(
      { foo: { count: 0, 'bar.boo': { msg: 'hello', zoo: { 'a.b': null, z: null } } } },
      { foo: { count: 0, 'bar\\boo': { msg: 'hello', zoo: { 'a\\b': null, z: null } } } },
    );
    test(
      [{ foo: { count: 0, 'bar.boo': { msg: 'hello', zoo: { 'a.b': null, z: null } } } }],
      [{ foo: { count: 0, 'bar\\boo': { msg: 'hello', zoo: { 'a\\b': null, z: null } } } }],
    );
    test(
      { foo: [{ 'a.b': 1 }, { 'b.c.d': 2 }, { e: 3 }] },
      { foo: [{ 'a\\b': 1 }, { 'b\\c\\d': 2 }, { e: 3 }] },
    );
  });
});
