import { Patch } from '.';
import { expect, t } from '../test';

describe('Patch', () => {
  describe('toSet', () => {
    it('empty', () => {
      const test = (forward?: any, backward?: any) => {
        const res = Patch.toPatchSet(forward, backward);
        expect(res.prev).to.eql([]);
        expect(res.next).to.eql([]);
      };

      test();
      test([], []);
      test(undefined, []);
      test(undefined, []);
      test(undefined, [undefined]);
    });

    it('converts paths to strings', () => {
      const p1: t.ArrayPatch = { op: 'add', path: ['foo', 'bar'], value: 123 };
      const p2: t.ArrayPatch = { op: 'remove', path: ['foo', 'bar'], value: 123 };

      const test = (res: t.PatchSet) => {
        expect(res.next[0].op).to.eql('add');
        expect(res.prev[0].op).to.eql('remove');

        expect(res.next[0].path).to.eql('foo/bar');
        expect(res.prev[0].path).to.eql('foo/bar');
      };

      test(Patch.toPatchSet([p1], [p2]));
      test(Patch.toPatchSet(p1, p2));
    });

    it('throw: when property name contains "/"', () => {
      // NB: "/" characters in property names confuse the [patch] path values.
      //     Just don't use them!
      const patch: t.ArrayPatch = { op: 'add', path: ['foo', 'bar/baz'], value: 123 };
      const err = /Property names cannot contain the "\/" character/;

      expect(() => Patch.toPatchSet(patch)).to.throw(err);
      expect(() => Patch.toPatchSet([], patch)).to.throw(err);
    });
  });
});
