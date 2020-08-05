import { delay } from 'rxjs/operators';

import { t } from '../common';

export const registration: t.ModuleStrategy = (input) => {
  const module = input as t.IModule<any, t.ModuleEvent>;
  const actions = module.action();

  actions
    .dispatched<t.IModuleRegisterEvent>('Module/register')
    .pipe(delay(0)) // NB: Break synchronous flow
    .subscribe((e) => {
      // Add the new child module.
      const root: t.ITreeNode = {
        id: e.id,
        props: { treeview: { label: e.name || 'Unnamed' } },
      };
      const child = module.add({ root });
      const id = child.id;
      module.dispatch({ type: 'Module/registered', payload: { id: id } });

      // Alert listeners when disposed.
      child.dispose$.subscribe((e) => {
        module.dispatch({ type: 'Module/disposed', payload: { id: id } });
      });
    });
};

/**
 * Index of strategies for controlling a module.
 */
export const ModuleStrategies: t.ModuleStrategies = {
  default: registration,
  registration,
};
