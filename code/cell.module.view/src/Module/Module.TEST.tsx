import * as React from 'react';
import { Subject } from 'rxjs';

import { Module } from '.';
import { expect, t, rx } from '../test';

type MyView = 'View-1' | 'View-2';
type MyTarget = 'ROOT' | 'PANEL';
type MyData = { count: number };
type MyProps = t.IViewModuleProps<MyData, MyView, MyTarget>;
export type MyModule = t.IModule<MyProps>;

type P = MyProps;

const event$ = new Subject<t.Event>();
const events = Module.events(event$);
const bus = rx.bus(event$);
const fire = Module.fire<P>(bus);

const create = <P extends MyProps = MyProps>(
  args: { root?: string | t.ITreeNode<P>; view?: MyView; data?: MyData } = {},
) => {
  return Module.create<P>({ ...args, bus });
};

describe('Module (ViewModule)', () => {
  afterEach(() => {
    const modules = fire.find(); // All modules.
    modules.forEach((module) => module.dispose());
  });

  describe('create', () => {
    it('no params (default)', () => {
      const module = Module.create<P>({ bus });
      expect(module.state.props?.view).to.eql(undefined);
      expect(module.state.props?.region).to.eql(undefined);
      expect(module.state.props?.data).to.eql(undefined);
      expect(module.state.props?.treeview).to.eql({});
    });

    it('param: view', () => {
      const module1 = Module.create<P>({ bus, view: 'View-1' });
      const module2 = Module.create<P>({
        bus,
        view: 'View-2',
        root: { id: 'foo', props: { view: 'View-1' } },
      });

      expect(module1.state.props?.view).to.eql('View-1');
      expect(module2.state.props?.view).to.eql('View-2'); // NB: Param overrides root data.
    });

    it('param: treeview', () => {
      const module1 = Module.create<P>({ bus, treeview: { label: 'hello' } });
      const module2 = Module.create<P>({
        bus,
        treeview: { label: 'title' },
        root: { id: 'foo', props: { treeview: { label: 'foo', icon: 'Face' } } },
      });
      expect(module1.state.props?.treeview?.label).to.eql('hello');
      expect(module2.state.props?.treeview?.label).to.eql('title');
      expect(module2.state.props?.treeview?.icon).to.eql('Face');
    });

    it('param: data', () => {
      const module = Module.create<P>({ bus, data: { count: 123 } });
      expect(module.state.props?.data?.count).to.eql(123);
    });
  });

  describe('event: "Module/render"', () => {
    it('matches specific events', () => {
      const module = create();
      const events = Module.events<P>(event$, module.dispose$);

      const fired: t.IModuleRender<P>[] = [];
      events.render('View-1').subscribe((e) => fired.push(e));

      fire.render({ view: 'View-1', module });
      fire.render({ view: 'View-2', module });

      expect(fired.length).to.eql(1);
      expect(fired[0].view).to.eql('View-1');
      expect(fired[0].region).to.eql(undefined);
      expect(fired[0].target).to.eql(undefined);
    });

    it('passes "region" and/or "target"', () => {
      const module = create();
      const events = Module.events<P>(event$, module.dispose$);

      const fired: t.IModuleRender<P>[] = [];
      events.render('View-1').subscribe((e) => fired.push(e));

      fire.render({ view: 'View-1', region: 'PANEL', module });
      fire.render({ view: 'View-1', region: 'PANEL', target: 'abc:foo', module });

      expect(fired.length).to.eql(2);
      expect(fired[0].view).to.eql('View-1');
      expect(fired[0].region).to.eql('PANEL');

      expect(fired[1].view).to.eql('View-1');
      expect(fired[1].region).to.eql('PANEL');
      expect(fired[1].target).to.eql('abc:foo');
    });

    it('matches all events ("view" undefined)', () => {
      const module = create();
      const events = Module.events<P>(event$, module.dispose$);

      const fired: t.IModuleRender<P>[] = [];
      events.render().subscribe((e) => fired.push(e));

      fire.render({ view: 'View-1', module });
      fire.render({ view: 'View-2', module });
      expect(fired.length).to.eql(2);
    });

    it('does not fire for handled events', () => {
      const module = create();
      const events = Module.events<P>(event$, module.dispose$);

      const fired: string[] = [];

      events.render('View-1').subscribe((e) => {
        fired.push('first');
        e.render(<div>hello</div>);
      });
      events.render('View-1').subscribe((e) => fired.push('second'));

      fire.render({ view: 'View-1', module });
      expect(fired.length).to.eql(1);
      expect(fired[0]).to.eql('first');
    });
  });

  describe('event: "Module/rendered"', () => {
    it('does not fire if nothing responded to the event', () => {
      const module = create();
      const events = Module.events<P>(event$, module.dispose$);

      let count = 0;
      events.rendered$.subscribe((e) => count++);

      fire.render({ view: 'View-1', region: 'PANEL', module });
      expect(count).to.eql(0);
    });

    it('passes "region" and/or "target" on rendered event', () => {
      const module = create();
      const events = Module.events<P>(event$, module.dispose$);

      const fired: t.IModuleRendered<P>[] = [];
      events.rendered$.subscribe((e) => fired.push(e));

      let count = 0;
      events.render('View-1').subscribe((e) => {
        count++;
        e.render(<div>{`hello-${count}`}</div>);
      });

      fire.render({ view: 'View-1', region: 'PANEL', module });
      fire.render({ view: 'View-1', module, target: 'abc:foo' });

      expect(fired.length).to.eql(2);
      expect(fired[0].view).to.eql('View-1');
      expect(fired[1].view).to.eql('View-1');

      expect(fired[0].el?.props.children).to.eql('hello-1');
      expect(fired[1].el?.props.children).to.eql('hello-2');

      expect(fired[0].region).to.eql('PANEL');
      expect(fired[1].region).to.eql(undefined);

      expect(fired[0].target).to.eql(undefined);
      expect(fired[1].target).to.eql('abc:foo');
    });
  });

  describe('event: "Module/selection"', () => {
    it('from root: tree-node', () => {
      const parent = create({ root: 'parent', view: 'View-1', data: { count: 123 } });
      const fired: t.IModuleSelection<any>[] = [];
      events.selection$.subscribe((e) => fired.push(e));

      fire.selection({ root: parent.state, selected: parent.id });

      expect(fired.length).to.eql(1);
      expect(fired[0].module).to.eql(parent.id);
      expect(fired[0].selection?.id).to.eql(parent.id);
      expect(fired[0].view).to.eql('View-1');
      expect(fired[0].data).to.eql({ count: 123 });
    });

    it('from root: module', () => {
      const root = create({ root: 'parent', view: 'View-1', data: { count: 123 } });
      const fired: t.IModuleSelection<any>[] = [];
      events.selection$.subscribe((e) => fired.push(e));

      fire.selection({ root, selected: root.id });

      expect(fired.length).to.eql(1);
      expect(fired[0].module).to.eql(root.id);
      expect(fired[0].selection?.id).to.eql(root.id);
      expect(fired[0].view).to.eql('View-1');
      expect(fired[0].data).to.eql({ count: 123 });
    });

    it('fires event through child modules only', () => {
      const root = create({ root: 'parent' });
      const child1 = create({
        root: {
          id: 'child-1',
          props: { view: 'View-1' },
          children: [
            {
              id: 'child-1.1',
              props: { data: { count: 123 }, view: 'View-2', treeview: { label: 'Hello' } },
            },
            {
              id: 'child-1.2',
            },
          ],
        },
      });
      const child2 = create({
        root: { id: 'child-2', children: [{ id: 'child-2.1' }, { id: 'child-2.2' }] },
      });

      fire.register(child1, root.id);
      fire.register(child2, root.id);

      const fired: t.IModuleSelection<any>[] = [];
      events.selection$.subscribe((e) => fired.push(e));

      const selection1 = `${child1.namespace}:child-1.1`;
      const selection2 = `${child1.namespace}:child-1.2`;

      fire.selection({ root, selected: selection1 });
      fire.selection({ root, selected: selection2 });

      expect(fired.length).to.eql(2);

      expect(fired[0].module).to.eql(child1.id);
      expect(fired[0].selection?.id).to.eql(selection1);
      expect(fired[0].selection?.props).to.eql({ label: 'Hello' });
      expect(fired[0].data).to.eql({ count: 123 });
      expect(fired[0].view).to.eql('View-2'); // NB: specified on node, overrides parent module view.

      expect(fired[1].module).to.eql(child1.id);
      expect(fired[1].selection?.id).to.eql(selection2);
      expect(fired[1].selection?.props).to.eql({});
      expect(fired[1].data).to.eql({});
      expect(fired[1].view).to.eql('View-1'); // NB: not specified on node, taken from parent module (default).
    });

    it('clears selection', () => {
      const root = create({ root: 'parent', view: 'View-1' });
      const child = create({ root: 'child', view: 'View-2', data: { count: 123 } });
      fire.register(child, root.id);

      const fired: t.IModuleSelection<any>[] = [];
      events.selection$.subscribe((e) => fired.push(e));

      fire.selection({ root, selected: child.id });
      fire.selection({ root });

      expect(fired.length).to.eql(2);
      expect(fired[1].module).to.eql(root.id);
      expect(fired[1].selection).to.eql(undefined);
    });

    it('throw: node does not exist in tree', () => {
      const root = create({ root: 'parent', view: 'View-1' });
      const fn = () => fire.selection({ root, selected: '404' });
      expect(fn).to.throw(/node does not exist/);
    });

    it('strategy: fires when nav value changes on state object', () => {
      const root = create({ root: 'parent', view: 'View-1', data: { count: 123 } });

      const fired: t.IModuleSelection<any>[] = [];
      events.selection$.subscribe((e) => fired.push(e));

      root.change((draft, ctx) => {
        ctx.props(draft, (props) => {
          const treeview = props.treeview || (props.treeview = {});
          const nav = treeview.nav || (treeview.nav = {});
          nav.selected = root.id;
        });
      });

      expect(fired.length).to.eql(1);
      expect(fired[0].module).to.eql(root.id);
      expect(fired[0].view).to.eql('View-1');
      expect(fired[0].data).to.eql({ count: 123 });
    });
  });
});
