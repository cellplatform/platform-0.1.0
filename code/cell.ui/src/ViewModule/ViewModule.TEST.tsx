import * as React from 'react';
import { Subject } from 'rxjs';

import { ViewModule } from '.';
import { expect, t } from '../test';

type MyView = 'View-1' | 'View-2';
type MyData = { count: number };
type MyProps = t.IViewModuleProps<MyData, MyView>;
export type MyModule = t.IModule<MyProps>;

const event$ = new Subject<t.Event>();
const events = ViewModule.events(event$);
const bus: t.EventBus = { fire: (e: t.Event) => event$.next(e), event$ };
const fire = ViewModule.fire(bus);

const create = <P extends MyProps = MyProps>(
  args: { root?: string | t.ITreeNode<P>; view?: MyView; data?: MyData } = {},
) => {
  return ViewModule.create<P>({ ...args, bus });
};

describe('ViewModule', () => {
  describe('create', () => {
    it('no params (default)', () => {
      const module = ViewModule.create<MyProps>({ bus });
      expect(module.root.props?.view).to.eql('');
      expect(module.root.props?.treeview).to.eql({});
      expect(module.root.props?.data).to.eql({});
    });

    it('param: view', () => {
      const module1 = ViewModule.create<MyProps>({ bus, view: 'View-1' });
      const module2 = ViewModule.create<MyProps>({
        bus,
        view: 'View-2',
        root: { id: 'foo', props: { view: 'View-1' } },
      });

      expect(module1.root.props?.view).to.eql('View-1');
      expect(module2.root.props?.view).to.eql('View-2'); // NB: Param overrides root data.
    });

    it('param: treeview', () => {
      const module1 = ViewModule.create<MyProps>({ bus, treeview: { label: 'hello' } });
      const module2 = ViewModule.create<MyProps>({
        bus,
        treeview: { label: 'title' },
        root: { id: 'foo', props: { treeview: { label: 'foo', icon: 'Face' } } },
      });
      expect(module1.root.props?.treeview?.label).to.eql('hello');
      expect(module2.root.props?.treeview?.label).to.eql('title');
      expect(module2.root.props?.treeview?.icon).to.eql('Face');
    });

    it('param: data', () => {
      const module = ViewModule.create<MyProps>({ bus, data: { count: 123 } });
      expect(module.root.props?.data?.count).to.eql(123);
    });
  });

  describe('event: "Module/render"', () => {
    const events = ViewModule.events<MyProps>(event$);
    const module = create();
    const fireRender = (view: MyProps['view']) => fire.render({ module: module.id, view });

    it('matches specific events', () => {
      const fired: t.IModuleRender<any>[] = [];
      events.render('View-1').subscribe((e) => fired.push(e));

      fireRender('View-1');
      fireRender('View-2');

      expect(fired.length).to.eql(1);
      expect(fired[0].view).to.eql('View-1');
    });

    it('matches all events ("view" undefined)', () => {
      const fired: t.IModuleRender<any>[] = [];
      events.render().subscribe((e) => fired.push(e));

      fireRender('View-1');
      fireRender('View-2');
      expect(fired.length).to.eql(2);
    });

    it('does not fire for handled events', () => {
      const fired: string[] = [];

      events.render('View-1').subscribe((e) => {
        fired.push('first');
        e.render(<div>hello</div>);
      });
      events.render('View-1').subscribe((e) => fired.push('second'));

      fireRender('View-1');
      expect(fired.length).to.eql(1);
      expect(fired[0]).to.eql('first');
    });
  });

  describe('event: "Module/selection"', () => {
    it('from root: tree-node', () => {
      const parent = create({ root: 'parent', view: 'View-1', data: { count: 123 } });
      const fired: t.IModuleSelection<any>[] = [];
      events.selection$.subscribe((e) => fired.push(e));

      fire.selection({ root: parent.root, selected: parent.id });

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
