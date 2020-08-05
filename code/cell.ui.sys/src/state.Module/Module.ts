import { TreeState } from '@platform/state';
import { filter } from 'rxjs/operators';

import { t } from '../common';
import { publish } from './Module.pub';
import { subscribe } from './Module.sub';
import * as events from './Module.events';
import { ModuleStrategies } from './ModuleStrategies';

const identity = TreeState.identity;

type O = Record<string, unknown>;
type Event = t.Event<O>;

export class Module {
  /**
   * Helpers for working with tree ids.
   */
  public static identity = TreeState.identity;

  /**
   * Index of common behavior strategies.
   */
  public static strategies = ModuleStrategies;

  /**
   * Create a new module.
   */
  public static create<D extends O, A extends Event = any>(
    args?: t.ModuleArgs<D>,
  ): t.IModule<D, A> {
    args = { ...args };
    args.root = args.root || 'module';
    const strategy = args.strategy;
    delete args.strategy;

    const module = TreeState.create<t.ITreeNodeModule<D>>(args) as t.IModule<D, A>;
    events.monitorAndDispatchChanged(module);

    if (strategy) {
      strategy(module);
    }

    return module;
  }

  /**
   * Register a new module within the tree, providing a promise/callback
   * that returns the registered module.
   */
  public static async register(within: t.IModule, payload: t.IModuleRegister) {
    return new Promise<t.IModule>((resolve, reject) => {
      within
        .action()
        .dispatched<t.IModuleRegisteredEvent>('Module/registered')
        .pipe(filter((e) => e.id === payload.id || identity.key(e.id) === payload.id))
        .subscribe((e) => {
          const child = within.find((item) => item.toString() === e.id);
          resolve(child);
        });
      within.dispatch({ type: 'Module/register', payload });
    });
  }

  /**
   * Broadcasts events from the module (and all child modules)
   * throw the given pipe (fire).
   */
  public static publish = publish;
  public static subscribe = subscribe;

  /**
   * Construct an event helper.
   */
  public static events = events.create;
  public static isModuleEvent = events.isModuleEvent;
}
