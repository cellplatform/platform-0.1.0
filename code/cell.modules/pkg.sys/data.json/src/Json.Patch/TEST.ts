import { isDraft } from 'immer';

import { Patch } from '.';
import { expect, t, Test, time } from '../test';

export default Test.describe('Patch', (e) => {
  e.describe('toObject', (e) => {
    type T = { count: number; items?: any[] };

    e.it('{ object }', () => {
      let original: T | undefined;
      Patch.change<T>({ count: 0 }, (draft) => {
        draft.count = 123;
        expect(draft.count).to.eql(123);
        original = Patch.toObject<T>(draft);
      });
      expect(isDraft(original)).to.eql(false);
      expect(original?.count).to.eql(0);
    });

    e.it('[ array ]', () => {
      let obj: T = { count: 0, items: [] };
      let list: any;

      const change1 = Patch.change(obj, (draft) => {
        draft.items = [{ id: 1 }, { items: [[{ msg: 'hello' }]] }];
      });

      obj = Patch.apply(obj, change1.patches);

      Patch.change(obj, (draft) => {
        const items = draft.items || [];
        expect(items.length).to.eql(2);
        expect(isDraft(items[0])).to.eql(true);
        expect(isDraft(items[1])).to.eql(true);
        expect(draft.items).to.eql([{ id: 1 }, { items: [[{ msg: 'hello' }]] }]);

        list = Patch.toObject(draft.items);
      });

      expect(list).to.eql([{ id: 1 }, { items: [[{ msg: 'hello' }]] }]);
      expect(isDraft(list[0])).to.eql(false);
      expect(isDraft(list[1])).to.eql(false);
    });

    e.it('undefined', () => {
      const obj: T = { count: 0 };
      let list: any;
      Patch.change(obj, (draft) => {
        list = Patch.toObject(draft.items);
      });
      expect(list).to.eql(undefined);
    });
  });

  e.describe('toPatchSet', (e) => {
    e.it('empty', () => {
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

    e.it('converts paths to strings', () => {
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

    e.it('throw: when property name contains "/"', () => {
      // NB: "/" characters in property names confuse the [patch] path values.
      //     Just don't do it!
      const patch: t.ArrayPatch = { op: 'add', path: ['foo', 'bar/baz'], value: 123 };
      const err = /Property names cannot contain the "\/" character/;

      expect(() => Patch.toPatchSet(patch)).to.throw(err);
      expect(() => Patch.toPatchSet([], patch)).to.throw(err);
    });
  });

  e.describe('isEmpty', (e) => {
    const test = (input: any, expected: boolean) => {
      const res = Patch.isEmpty(input);
      expect(res).to.eql(expected);
    };

    e.it('is empty', () => {
      test(undefined, true);
      test(null, true);
      test({}, true);
      test(' ', true);
      test({ next: [], prev: [] }, true);
    });

    e.it('is not empty', () => {
      const p1: t.ArrayPatch = { op: 'add', path: ['foo', 'bar'], value: 123 };
      const p2: t.ArrayPatch = { op: 'remove', path: ['foo', 'bar'], value: 123 };
      const patches = Patch.toPatchSet([p1, p2], [p2, p1]);
      test(patches, false);
    });
  });

  e.describe('change (aka "produce" patches)', (e) => {
    e.it('change (op: "update" change)', () => {
      const obj = { msg: 'hello', child: { foo: [123] } };

      const res = Patch.change(obj, (draft) => {
        draft.msg = 'foobar';
        draft.child.foo.push(456);
      });

      expect(res.to.msg).to.eql('foobar');
      expect(res.to.child.foo).to.eql([123, 456]);

      expect(res.op).to.eql('update');
      expect(res.patches.prev.map((c) => c.path)).to.eql(['child/foo/length', 'msg']);
      expect(res.patches.next.map((c) => c.path)).to.eql(['child/foo/1', 'msg']);
    });

    e.it('change (op: "replace" change)', () => {
      const obj1 = { child: { msg: 'one' } };
      const obj2 = { child: { msg: 'two' } };

      const res = Patch.change(obj1, obj2);

      expect(res.op).to.eql('replace');
      expect(res.to).to.eql(obj2);

      expect(res.patches.prev).to.eql([{ op: 'replace', path: '', value: obj1 }]);
      expect(res.patches.next).to.eql([{ op: 'replace', path: '', value: obj2 }]);
    });

    e.it('changeAsync', async () => {
      const obj = { msg: 'hello', child: { foo: [123] } };

      const res = await Patch.changeAsync(obj, async (draft) => {
        await time.wait(10);
        draft.msg = 'foobar';
        draft.child.foo.push(456);
      });

      expect(res.to.msg).to.eql('foobar');
      expect(res.to.child.foo).to.eql([123, 456]);

      expect(res.op).to.eql('update');
      expect(res.patches.prev.map((c) => c.path)).to.eql(['child/foo/length', 'msg']);
      expect(res.patches.next.map((c) => c.path)).to.eql(['child/foo/1', 'msg']);
    });

    e.it('ctx parameter - { toObject }', async () => {
      const obj = {};

      Patch.change(obj, async (draft, ctx) => {
        expect(ctx.toObject).to.equal(Patch.toObject);
      });

      await Patch.changeAsync(obj, async (draft, ctx) => {
        expect(ctx.toObject).to.equal(Patch.toObject);
      });
    });
  });

  e.describe('apply', (e) => {
    e.it('applies patches forward (next)', () => {
      const obj = { child: { foo: [123] } };
      const res = Patch.change(obj, (draft) => draft.child.foo.push(456));

      expect(obj.child.foo).to.eql([123]); // NB: No change.
      expect(res.op).to.eql('update');
      expect(res.to.child.foo).to.eql([123, 456]);

      // NB: PatchSet passed, [next] set of patches assumed.
      expect(Patch.apply(obj, res.patches).child.foo).to.eql([123, 456]);
    });

    e.it('applies patches backward (prev)', () => {
      const obj = { child: { foo: [123] } };
      const res = Patch.change(obj, (draft) => draft.child.foo.push(456));

      const next = Patch.apply(obj, res.patches.next);
      const prev = Patch.apply(next, res.patches.prev);

      expect(next.child.foo).to.eql([123, 456]);
      expect(prev.child.foo).to.eql([123]);
    });
  });
});
