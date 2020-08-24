import { filter } from 'rxjs/operators';

import { ViewModule, t } from '../common';
import { renderer } from './view/render';

type P = t.MyProps;

export const SampleModule: t.IModuleDef = {
  /**
   * Initialize the module.
   */
  init(bus, parent) {
    const fire = ViewModule.fire<P>(bus);

    /**
     * Create main module.
     */
    const main = ViewModule.create<P>({
      bus,
      root: { id: 'sample', props: { treeview: { label: 'Sample' } } },
    });
    const until$ = main.dispose$;

    const match: t.ModuleFilterEvent = (e) => modules.some((m) => m.contains(e.module));
    const event$ = ViewModule.filter(bus.event$, match);
    const events = ViewModule.events<P>(event$, until$);

    /**
     * Setup renderer.
     */
    renderer({ bus, events });

    /**
     * Create sample child modules.
     */
    const diagram = ViewModule.create<P>({
      bus,
      view: 'DIAGRAM',
      root: { id: 'diagram', props: { treeview: { label: 'Diagram' } } },
    });
    const demo = ViewModule.create<P>({
      bus,
      view: 'SAMPLE',
      root: { id: 'demo', props: { treeview: { label: 'Demo' } } },
    });
    const modules = [main, diagram, demo];

    ViewModule.register(bus, diagram, main.id);
    ViewModule.register(bus, demo, main.id);

    /**
     * Catch un-targetted (wildcard) registrations and route
     * them into the MAIN module.
     */
    ViewModule.events(bus.event$, until$)
      .register$.pipe(filter((e) => !e.parent))
      .subscribe((e) => {
        const module = fire.request(e.module).module;
        if (module) {
          ViewModule.register(bus, module, main.id);
        }
      });

    /**
     * STRATEGY: Render on selection.
     */
    const behavior = (module: t.IModule) => {
      const event$ = ViewModule.filter(module.event.$, match);
      const events = ViewModule.events<P>(event$, until$);
      events.selection$.subscribe((e) => {
        const selected = e.selection?.id;
        const { view, data } = e;
        fire.render({ selected, module, data, view, notFound: '404' });
      });
    };

    behavior(main);
    behavior(demo);
    behavior(diagram);

    // TEMP 🐷
    muckWithDiagram(diagram);
    muckWithDemo(demo);

    // Finish up.
    return main;
  },
};

/**
 * TEMP
 */

function muckWithDiagram(module: t.MyModule) {
  module.change((draft, ctx) => {
    ctx.props(draft, (props) => {
      props.data = { foo: 'FOO' };
    });
    ctx.children(draft, (children) => {
      children.push(...[{ id: 'one' }, { id: 'two' }, { id: 'three' }]);
    });
  });
}

function muckWithDemo(module: t.MyModule) {
  module.change((draft, ctx) => {
    ctx.props(draft, (props) => {
      props.data = { foo: 'FOO' };

      // const treeview = props.treeview || (props.treeview = {});
      // treeview.isVisible = false;
    });

    ctx.children(draft, (children) => {
      children.push({
        id: 'zinger',
        props: { view: 'TREE_COLUMNS', treeview: { label: 'Tree Columns' } },
      });
      children.push(...[{ id: 'one' }, { id: 'two' }, { id: 'three' }]);
      children.push({ id: 'foo-404', props: { view: 'FOO', treeview: { label: 'Foo (404)' } } });
    });
  });

  module.change((draft, ctx) => {
    const child = ctx.children(draft)[1];
    ctx.props(child, (props) => {
      props.treeview = {
        inline: {},
        chevron: { isVisible: true },
        ...props.treeview,
        label: 'hello',
      };
    });
    if (!child.children) {
      child.children = [
        { id: 'my-child-1', props: { treeview: { label: 'child-1' } } },
        { id: 'my-child-2', props: { treeview: { label: 'child-2' } } },
        { id: 'my-child-3', props: { treeview: { label: 'child-3' } } },
      ];
    }
  });
}
