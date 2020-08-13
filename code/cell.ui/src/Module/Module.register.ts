import { t } from '../common';
import { formatModuleNode } from './Module.create';

type P = t.IModuleProps;

/**
 * Registers a new module as a child of another module.
 */
export function register<T extends P>(parent: t.IModule<any>): t.ModuleRegister<T> {
  return {
    add(args) {
      const root = formatModuleNode<T>(
        { id: args.id },
        {
          treeview: args.treeview,
          view: args.view,
        },
      );

      // parent.add()
      const module = parent.add({ root }) as t.IModule<T>;
      const id = module.id;
      const path = `${parent.id}/${id}`;

      parent.dispatch({
        type: 'Module/child/registered',
        payload: { module: parent.id, path },
      });

      // Alert listeners when disposed.
      module.dispose$.subscribe((e) => {
        parent.dispatch({
          type: 'Module/child/disposed',
          payload: { module: parent.id, path },
        });
      });

      // Finish up.
      return { id, module, path };
    },
  };
}

/**
 * TODO 🐷
 *
 *
 *  - ModuleEvents.register<t.View>('view')
 */
