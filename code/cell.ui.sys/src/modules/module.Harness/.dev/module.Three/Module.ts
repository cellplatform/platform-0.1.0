import { Module, t } from './common';
import { renderer } from './Module.render';

type P = t.ThreeProps;

export const ThreeModule: t.ThreeModuleDef = {
  /**
   * ENTRY: Initialize a new module from the definition.
   */
  init(bus) {
    const module = Module.create<P>({
      bus,
      root: { id: '', props: { treeview: { label: 'Three' }, view: 'DEFAULT' } },
    });

    /**
     * Setup event pub/sub.
     */
    const match: t.ModuleFilterEvent = (e) => e.module == module.id || module.contains(e.module);
    const events = Module.events<P>(Module.filter(bus.event$, match), module.dispose$);
    const fire = Module.fire<P>(bus);

    /**
     * STRATEGY: render user-interface.
     */
    renderer({ bus, events, module });
    events.selection$.subscribe((e) => {
      const { view, data } = e;
      fire.render({ module, data, view, notFound: '404' });
    });

    return module;
  },
};
