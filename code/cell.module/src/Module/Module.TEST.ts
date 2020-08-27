import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Module } from '.';
import { expect, t } from '../test';

type MyData = { count: number };
type MyProps = t.IModuleProps<MyData>;
export type MyModule = t.IModule<MyProps>;

type P = MyProps;

const event$ = new Subject<t.Event>();
const bus: t.EventBus = { fire: (e: t.Event) => event$.next(e), event$ };
const fire = Module.fire(bus);

const create = <P extends MyProps = MyProps>(
  args: { root?: string | t.ITreeNode<P>; data?: MyData } = {},
) => {
  return Module.create<P>({ ...args, bus });
};

describe('Module', () => {
  describe('create', () => {
    it('create', () => {
      const module = create();
      const root = module.root;

      expect(Module.Identity.hasNamespace(root.id)).to.eql(true);
      expect(Module.Identity.key(root.id)).to.eql('module');

      expect(root.props?.kind).to.eql('MODULE');
      expect(root.props?.data).to.eql({});
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
      const events = Module.events(parent);
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

      expect(parent.root.children).to.eql(undefined);
      expect(parent.find((e) => e.id === child.id)).to.eql(undefined);

      const res = fire.register(child, parent.id);

      expect(res.ok).to.eql(true);
      expect(res.parent?.id).to.eql(parent.id);
      expect(res.module.id).to.eql(child.id);

      expect(parent.find((e) => e.id === child.id)).to.equal(child);
      expect((parent.root.children || [])[0]).to.eql(child.root);
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

    it('parent not specified - catch all completes registration', () => {
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
    it('finds module: complete id', () => {
      const module = create();
      const res = Module.fire(bus).request(module.id);
      expect(res?.id).to.eql(module.id);
    });

    it('finds module: wildcard ("*:id")', () => {
      const module = create({ root: 'foo' });
      const res = Module.fire(bus).request('*:foo');
      expect(res?.id).to.eql(module.id);
    });

    it('not found', () => {
      const res = Module.fire(bus).request('ns:404');
      expect(res).to.eql(undefined);
    });
  });

  describe('change', () => {
    it('event: "Module/changed"', () => {
      const module = create({ root: 'foo' });

      const fired: t.IModuleChanged<P>[] = [];
      Module.events<P>(module).changed$.subscribe((e) => fired.push(e));
      Module.events<P>(bus.event$).changed$.subscribe((e) => fired.push(e));

      module.change((draft, ctx) => {
        ctx.props(draft, (props) => {
          const data = props.data || (props.data = { count: 123 });
          data.count = 456;
        });
      });

      expect(fired.length).to.eql(2);
      expect(fired[0].change.to.props?.data?.count).to.eql(456);
      expect(fired[1].change.to.props?.data?.count).to.eql(456);
    });

    it('event: "Module/patched"', () => {
      const module = create({ root: 'foo' });

      const fired: t.IModulePatched[] = [];
      Module.events<P>(module).patched$.subscribe((e) => fired.push(e));
      Module.events<P>(bus.event$).patched$.subscribe((e) => fired.push(e));

      module.change((draft, ctx) => {
        ctx.props(draft, (props) => {
          const data = props.data || (props.data = { count: 123 });
          data.count = 456;
        });
      });

      expect(fired.length).to.eql(2);
    });
  });
});
