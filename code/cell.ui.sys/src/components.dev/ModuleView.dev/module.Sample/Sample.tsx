import { filter } from 'rxjs/operators';

import { Module, t } from '../common';
import { renderer } from './Sample.renderer';

type P = t.MyProps;

export const SampleModule: t.IModuleDef = {
  /**
   * Initialize the module.
   */
  init(bus, parent) {
    /**
     * Create main module.
     */
    const main = Module.create<P>({ bus, root: 'sample', treeview: 'Sample' });
    const until$ = main.dispose$;
    const events = Module.events(bus.event$, until$);
    const fire = Module.fire<P>(bus);
    renderer({ bus, until$ });

    /**
     * Create sample child modules.
     */
    // const main = Module.create<P>({ bus, root: 'main', treeview: 'Main' });
    const diagram = Module.create<P>({
      bus,
      root: 'diagram',
      treeview: 'Diagram',
      view: 'DIAGRAM',
    });
    const demo = Module.create<P>({ bus, root: 'demo', treeview: 'Demo', view: 'SAMPLE' });

    Module.register(bus, diagram, main.id);
    Module.register(bus, demo, main.id);

    // TEMP 🐷
    muckWithDiagram(diagram);
    muckWithDemo(demo);

    /**
     * Catch un-targetted (wildcard) registrations and route
     * them into the MAIN module.
     */
    events.register$.pipe(filter((e) => !e.parent)).subscribe((e) => {
      const module = fire.request(e.module).module;
      if (module) {
        Module.register(bus, module, main.id);
      }
    });

    const behavior = (module: t.IModule) => {
      const events = Module.events(module, until$);

      events.selection$.subscribe((e) => {
        const selected = e.tree.selection?.id;

        // module.query.find
        const node = module.query.findById(selected);
        // const module = module.find((child) => child.tree.query.exists(selected));

        console.group('🌳 ');

        console.log('module.id', module.id);
        console.log('module.namespace', module.namespace);
        console.log('selected', selected);
        console.log('node', node);
        console.groupEnd();

        // type N = t.ITreeNode<t.MyProps>;
        // const get = (selected?: N, module?: t.IModule) => {
        //   const view = selected?.props?.view || module?.root.props?.view;
        //   const data = selected?.props?.data || module?.root.props?.data;
        //   return { view, data };
        // };

        // /**
        //  * Controller causes frame(s) to re-render.
        //  */
        // if (module) {
        //   const { view, data } = get(node, module);
        //   console.log('view', view);
        //   const el = fire.render({ selected, module: module.id, data, view });
        //   if (!el) {
        //     // Nothing responded with an element.
        //     // Render the "404 - Not Found" view.
        //     fire.render({ selected, module: module.id, data, view: '404' });
        //   }
        // }
      });
    };

    // behavior(main);
    behavior(demo);

    /**
     * [Strategy] Logic
     *    On node selection in tree, render the appropriate view.
     */
    const mainEvents = Module.events(main, until$);

    mainEvents.selection$.subscribe((e) => {
      const selected = e.tree.selection?.id;
      const node = main.query.findById(selected);
      const module = main.find((child) => child.tree.query.exists(selected));

      // console.log('selected', selected);
      // console.log('node', node);

      type N = t.ITreeNode<t.MyProps>;
      const get = (selected?: N, module?: t.IModule) => {
        const view = selected?.props?.view || module?.root.props?.view;
        const data = selected?.props?.data || module?.root.props?.data;
        return { view, data };
      };

      /**
       * Controller causes frame(s) to re-render.
       */
      if (module) {
        const { view, data } = get(node, module);
        // console.log('view', view);
        // const props = module.root.props || {};
        // const module = selected.id;
        // const { view, data } = props;
        const el = fire.render({ selected, module: module.id, data, view });
        if (!el) {
          // Nothing responded with an element.
          // Render the "404 - Not Found" view.
          fire.render({ selected, module: module.id, data, view: '404' });
        }
      }
    });

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
      // children.push({ id: 'sub-tree', props: { treeview: { label: 'Sub-tree' } } });
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
