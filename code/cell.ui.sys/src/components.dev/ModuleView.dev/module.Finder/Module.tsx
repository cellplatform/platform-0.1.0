import { ViewModule } from '../common';
import * as t from './types';
import { renderer } from './view/render';

type P = t.FinderProps;

export const FinderModule: t.IModuleDef = {
  /**
   * Initialize a new module from the definition.
   */
  init(bus, parent) {
    const fire = ViewModule.fire<P>(bus);
    const module = ViewModule.create<P>({
      bus,
      view: 'DEFAULT',
      root: { id: 'finder', props: { treeview: { label: 'Finder' } } },
    });
    const until$ = module.dispose$;
    ViewModule.register(bus, module, parent);

    const match: t.ModuleFilterEvent = (e) => e.module == module.id || module.contains(e.module);
    const event$ = ViewModule.filter(bus.event$, match);
    const events = ViewModule.events<P>(event$, until$);

    renderer(events);

    events.selection$.subscribe((e) => {
      const { view, data } = e;
      const selected = e.selection?.id;
      fire.render({ selected, module, data, view, notFound: '404' });
    });

    return module;
  },
};
