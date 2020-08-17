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
    const module = Module.create<P>({ bus, root: 'sample', treeview: 'Sample' });
    const until$ = module.dispose$;
    const events = Module.events(bus.event$, until$);
    const fire = Module.fire<P>(bus);
    renderer({ bus, until$ });

    /**
     * Create sample child modules.
     */
    const main = Module.create<P>({ bus, root: 'main' });
    const diagram = Module.create<P>({
      bus,
      root: 'diagram',
      treeview: 'Diagram',
      view: 'DIAGRAM',
    });
    const demo = Module.create<P>({ bus, root: 'demo', treeview: 'Demo', view: 'SAMPLE' });

    Module.register(bus, diagram, main.id);
    Module.register(bus, demo, main.id);

    /**
     * Catch un-targetted (wildcard) registrations and route
     * then into the MAIN module.
     */
    events.register$.pipe(filter((e) => !e.parent)).subscribe((e) => {
      const module = fire.request(e.module).module;
      if (module) {
        Module.register(bus, module, main.id);
      }
    });

    /**
     * Controller Logic
     * On node selection in tree render appropriate view.
     */
    const mainEvents = Module.events(main, until$);

    mainEvents.selection$.subscribe((e) => {
      const id = e.tree.selection?.id;
      const selected = main.find((child) => child.tree.query.exists(id));

      /**
       * Controller causes frame(s) to re-render.
       */
      if (selected) {
        const props = selected.root.props || {};
        const module = selected.id;
        const { view, data } = props;
        const el = fire.render({ selected: id, module, data, view });
        if (!el) {
          fire.render({ selected: id, module, data, view: '404' });
        }
      }
    });

    // Finish up.
    return { main, demo, diagram };
  },
};
