import { Module } from '../common';
import * as t from './types';
import { renderer } from './Module.renderer';

type P = t.FinderProps;

export const FinderModule: t.IModuleDef = {
  /**
   * Initialize the module.
   */
  init(bus, parent) {
    const fire = Module.fire<P>(bus);
    const module = Module.create<P>({ bus, treeview: 'Finder', view: 'DEFAULT' });
    const until$ = module.dispose$;
    Module.register(bus, module, parent);

    const match: t.ModuleFilterEvent = (e) => e.module == module.id || module.contains(e.module);
    renderer({ bus, until$, filter: match });

    const events = Module.events<P>(bus.event$, until$).filter(match);
    events.selection$.subscribe((e) => {
      const selected = e.selection?.id;
      const { view, data } = e;
      fire.render({ selected, module, data, view, notFound: '404' });
    });

    return module;
  },
};
