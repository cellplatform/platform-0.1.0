import { t } from '../common';

import { formatModuleNode } from './Module.create';

type O = Record<string, unknown>;

/**
 * Registers a new module as a child of another module.
 */
export function register<T extends t.IModule = t.IModule, D extends O = any>(
  parent: t.IModule,
): t.ModuleRegister<T, D> {
  return {
    add(args) {
      const root = formatModuleNode(
        { id: args.id },
        {
          treeview: args.treeview,
          view: args.view,
        },
      );

      const module = parent.add({ root }) as T;
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
 * - register
 *    - registration (strongly typed view)
 *
 *  - ModuleEvents.register<t.View>('view')
 */
