import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Module } from '.';
import { expect, t, rx } from '../test';

type MyData = { count?: number; kind?: string };
type MyProps = t.IModuleProps<MyData>;
export type MyModule = t.IModule<MyProps>;

type P = MyProps;

const event$ = new Subject<t.Event>();
const bus = rx.bus(event$);
const fire = Module.fire(bus);

const create = <P extends MyProps = MyProps>(
  args: { root?: string | t.ITreeNode<P>; data?: MyData } = {},
) => {
  return Module.create<P>({ ...args, bus });
};

describe('Module', () => {
  afterEach(() => {
    const modules = fire.find(); // All modules.
    modules.forEach((module) => module.dispose());
  });

  describe('create', () => {
    it('create', () => {
      const module = create();
      const state = module.state;

      expect(Module.Identity.hasNamespace(state.id)).to.eql(true);
      expect(Module.Identity.key(state.id)).to.eql('module');

      expect(state.props?.kind).to.eql('Module');
      expect(state.props?.data).to.eql(undefined);
    });

    it('generates default id ("module")', () => {
      const test = (module: t.IModule) => {
        const { key } = Module.Identity.parse(module.id);
        expect(key).to.eql('module');
      };

      test(create());
      test(create({ root: '' }));
      test(create({ root: '  ' }));
      test(create({ root: { id: '' } }));
      test(create({ root: { id: '  ' } }));
    });

    it('throw: id contains "/" character', () => {
      const fn = () => create({ root: 'foo/bar' });
      expect(fn).to.throw(/cannot contain the "\/"/);
    });
  });

  describe.only('Module.is (flags)', () => {
    it('is.moduleEvent', () => {
      const test = (input: any, expected: boolean) => {
        expect(Module.is.moduleEvent(input)).to.eql(expected);
      };

      test({ type: 'Module/foo', payload: {} }, true);

      test({ type: 'Module', payload: {} }, false);
      test({ type: 'Bar/foo', payload: {} }, false);
      test(undefined, false);
      test(null, false);
    });

    it('is.module (kind)', () => {
      const test = (input: any, expected: boolean) => {
        expect(Module.is.module(input)).to.eql(expected);
      };

      test(undefined, false);
      test(null, false);
      test(123, false);

      test({ props: { kind: 'Module' } }, true);
      test({ props: { kind: 'Module:' } }, true);
      test({ props: { kind: 'Module:Foo' } }, true);
      test({ props: { kind: '  Module:Foo  ' } }, true);
      test({ props: { kind: 'Foo' } }, false);

      const module = create({});
      test(module.state, true);
    });
  });

  describe('events', () => {
    it('stops when [until$] fires', () => {
      const until$ = new Subject();
      const events = Module.events(bus.event$, until$);

      let count = 0;
      events.$.subscribe((e) => count++);

      fire.request('foo'); // NB: Ensure events are firing within test.
      fire.request('foo');
      expect(count).to.eql(2);

      count = 0;
      until$.next();

      fire.request('foo');
      expect(count).to.eql(0);
    });
  });

  describe('event: "Module/register"', () => {
    it('fires module registration events', () => {
      const parent = create({ root: 'parent' });
      const child = create({ root: 'child' });

      const register: t.IModuleRegister[] = [];
      const registered: t.IModuleRegistered[] = [];

      const child$ = Module.filter(event$, (e) => e.module === child.id);
      const childEvents = Module.events(child$);

      childEvents.register$.subscribe((e) => register.push(e));
      childEvents.registered$.subscribe((e) => registered.push(e));

      const res = Module.register(bus, child, parent.id); // NB: convenience alternative to using the [fire] helper (pass-through).

      expect(res.ok).to.eql(true);
      expect(res.module.id).to.eql(child.id);
      expect(res.parent?.id).to.eql(parent.id);

      expect(register.length).to.eql(1);
      expect(register[0].module).to.eql(child.id);
      expect(register[0].parent).to.eql(parent.id);

      expect(registered.length).to.eql(1);
      expect(registered[0].module).to.eql(child.id);
      expect(registered[0].parent).to.eql(parent.id);
    });

    it('fires "Module/child/registered"', () => {
      const parent = create({ root: 'parent' });
      const child = create({ root: 'child' });

      const fired: t.IModuleChildRegistered[] = [];
      const events = Module.events(bus.event$);
      events.childRegistered$.subscribe((e) => fired.push(e));

      const res = fire.register(child, parent.id);

      expect(res.ok).to.eql(true);
      expect(res.module.id).to.eql(child.id);
      expect(res.parent?.id).to.eql(parent.id);

      expect(fired.length).to.eql(1);
      expect(fired[0].module).to.eql(parent.id);
      expect(fired[0].child).to.eql(child.id);
    });

    it('inserts child within parent', () => {
      const parent = create({ root: 'parent' });
      const child = create({ root: 'child' });

      expect(parent.state.children).to.eql(undefined);
      expect(parent.find((e) => e.id === child.id)).to.eql(undefined);

      const res = fire.register(child, parent.id);

      expect(res.ok).to.eql(true);
      expect(res.parent?.id).to.eql(parent.id);
      expect(res.module.id).to.eql(child.id);

      expect(parent.find((e) => e.id === child.id)).to.equal(child);
      expect((parent.state.children || [])[0]).to.eql(child.state);
    });

    it('inserts child within sub-node of parent', () => {
      const parent = create({ root: { id: 'parent', children: [{ id: 'foo' }] } });
      const child = create({ root: 'child' });

      const findFoo = () => parent.query.find((e) => e.key === 'foo');

      const node1 = findFoo();
      expect(node1?.id.endsWith(':foo')).to.eql(true);
      expect(node1?.children).to.eql(undefined);

      const res = fire.register(child, node1);

      expect(res.ok).to.eql(true);
      expect(res.parent?.id).to.eql(parent.id);
      expect(res.module.id).to.eql(child.id);

      const node2 = findFoo();
      expect((node2?.children || []).length).to.eql(1);
      expect((node2?.children || [])[0].id).to.eql(child.id); // NB: inserted within sub-node.
    });

    it('parent not found', () => {
      const child = create({ root: 'child' });
      const res = fire.register(child, '404');

      expect(res.ok).to.eql(false);
      expect(res.module.id).to.eql(child.id);
      expect(res.parent).to.eql(undefined);
    });

    it('parent not specified - catch all completed registration', () => {
      const root = create({ root: 'parent' });
      const child = create({ root: 'child' });

      // Catch un-targetted (wildcard) registrations and route then into the root.
      Module.events(event$)
        .register$.pipe(filter((e) => !e.parent))
        .subscribe((e) => {
          const module = fire.request(e.module);
          if (module) {
            Module.register(bus, module, root.id);
          }
        });

      const res = fire.register(child);

      expect(res.ok).to.eql(true);
      expect(res.module.id).to.eql(child.id);
      expect(res.parent?.id).to.eql(root.id);
      expect(root.find((e) => e.id === child.id)).to.equal(child);
    });
  });

  describe('event: "Module/child/disposed"', () => {
    it('fires child disposed event', () => {
      const parent = create({ root: 'parent' });
      const child = create({ root: 'child' });

      const fired: t.IModuleChildDisposed[] = [];
      Module.events(event$).childDisposed$.subscribe((e) => fired.push(e));

      fire.register(child, parent.id);
      child.dispose();

      expect(fired.length).to.eql(1);
      expect(fired[0].module).to.eql(parent.id);
      expect(fired[0].child).to.eql(child.id);
    });

    it('removes child from parent', () => {
      const parent = create({ root: 'parent' });
      const child = create({ root: 'child' });
      fire.register(child, parent.id);

      expect(parent.find((e) => e.id === child.id)).to.equal(child);

      child.dispose();
      expect(parent.find((e) => e.id === child.id)).to.eql(undefined);
    });
  });

  describe('event: "Module/request"', () => {
    it('finds module', () => {
      const module = create();
      const res = fire.request(module.id);
      expect(res?.id).to.eql(module.id);
    });

    it('finds module (node)', () => {
      const module = create();
      const res = fire.request(module);
      expect(res).to.equal(module);
    });

    it('not found', () => {
      const res = fire.request('ns:404');
      expect(res).to.eql(undefined);
    });
  });

  describe('event: "Module/find"', () => {
    const init = () => {
      const parent = create({ root: 'parent', data: { kind: 'FOO', count: 456 } });
      const child1 = create({ root: 'child-1' });
      const child2 = create({ root: 'child-2', data: { count: 123 } });
      const child3 = create({ root: 'child-3', data: { count: 123, kind: 'FOO' } });
      fire.register(child1, parent);
      fire.register(child2, parent);
      fire.register(child3, child2);

      return { parent, child1, child2, child3 };
    };

    it('empty args (finds everything)', () => {
      init();
      expect(fire.find().length).to.eql(4);
      expect(fire.find({ data: {} }).length).to.eql(4);
      expect(fire.find({ key: '*' }).length).to.eql(4);
    });

    it('match on "key" (and scope)', () => {
      const { parent, child1, child2, child3 } = init();

      const res1 = fire.find({ key: 'child-1', module: '' }); // NB: empty namespace same as wildcard ("*").
      const res2 = fire.find({ key: 'child*' });
      const res3 = fire.find({ key: '*' }); // NB: everything.
      const res4 = fire.find({ key: 'child*', module: child2.id });

      expect(res1.length).to.eql(1);
      expect(res1[0]).to.equal(child1);

      expect(res2.length).to.eql(3);
      expect(res2[0]).to.equal(child1);
      expect(res2[1]).to.equal(child2);
      expect(res2[2]).to.equal(child3);

      expect(res3.length).to.eql(4);
      expect(res3[0]).to.equal(parent);
      expect(res3[1]).to.equal(child1);
      expect(res3[2]).to.equal(child2);
      expect(res3[3]).to.equal(child3);

      // NB: filtered within scope.
      expect(res4.length).to.eql(2);
      expect(res4[0].id).to.eql(child2.id); // NB: scope inclusive.
      expect(res4[1].id).to.eql(child3.id);
    });

    it('match on "namespace"', () => {
      const { parent, child1, child2 } = init();

      const res1 = fire.find({ namespace: `  ${parent.namespace}  ` }); // No match (because of padding).
      const res2 = fire.find({ namespace: `*${child1.namespace.substring(20)}` }); // Match.
      const res3 = fire.find({ namespace: parent.namespace }); // Match.
      const res4 = fire.find({ namespace: child2.namespace }); // Match.
      const res5 = fire.find({ namespace: child1.namespace, key: child2.key }); // No-match

      expect(res1.length).to.eql(0);

      expect(res2.length).to.eql(1);
      expect(res2[0]).to.eql(child1);

      expect(res3.length).to.eql(1);
      expect(res3[0]).to.eql(parent);

      expect(res4.length).to.eql(1);
      expect(res4[0]).to.eql(child2);

      expect(res5.length).to.eql(0);
    });

    it('match on {data} key values', () => {
      const { parent, child2, child3 } = init();

      const res1 = fire.find({ data: { foo: 123 } }); // No match.
      const res2 = fire.find({ data: { count: 123 } });
      const res3 = fire.find({ data: { kind: 'FOO' } });
      const res4 = fire.find({ data: { kind: 'F*' } });
      const res5 = fire.find({ data: { kind: 'FOO', count: 123 } });
      const res6 = fire.find({ data: { count: '123' } }); // NB: No match because `count` is not a number.

      expect(res1.length).to.eql(0);

      expect(res2.length).to.eql(2);
      expect(res2[0]).to.eql(child2);
      expect(res2[1]).to.eql(child3);

      expect(res3.length).to.eql(2);
      expect(res3[0]).to.eql(parent);
      expect(res3[1]).to.eql(child3);

      expect(res4.length).to.eql(2); // NB: wildcard (same as res3)
      expect(res4[0]).to.eql(parent);
      expect(res4[1]).to.eql(child3);

      expect(res5.length).to.eql(1);
      expect(res5[0]).to.eql(child3);

      expect(res6.length).to.eql(0);
    });
  });

  describe('change', () => {
    it('event: "Module/changed"', () => {
      const module = create({ root: 'foo' });

      const fired: t.IModuleChanged<P>[] = [];
      Module.events<P>(bus.event$).changed$.subscribe((e) => fired.push(e));

      module.change((draft, ctx) => {
        ctx.props(draft, (props) => {
          const data = props.data || (props.data = { count: 123 });
          data.count = 456;
        });
      });

      expect(fired.length).to.eql(1);
      expect(fired[0].change.to.props?.data?.count).to.eql(456);
    });

    it('event: "Module/patched"', () => {
      const module = create({ root: 'foo' });

      const fired: t.IModulePatched[] = [];
      Module.events<P>(bus.event$).patched$.subscribe((e) => fired.push(e));

      module.change((draft, ctx) => {
        ctx.props(draft, (props) => {
          const data = props.data || (props.data = { count: 123 });
          data.count = 456;
        });
      });

      expect(fired.length).to.eql(1);
    });
  });
});
