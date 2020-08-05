import { TreeState } from '@platform/state';
import { is } from '@platform/state/lib/common/is';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil, share } from 'rxjs/operators';

import { t } from '../common';
import * as events from './ModuleEvents';
import { ModuleStrategies } from './ModuleStrategy';

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
  public static broadcast<T extends t.IModule>(
    module: T,
    fire: t.FireEvent<any>,
    until$: Observable<any> = new Subject(),
  ): t.ModuleBroadcaster {
    const pipe = (e: t.Event) => fire(e);

    const dispose$ = new Subject<void>();
    const dispose = () => dispose$.next();
    until$.subscribe(() => dispose());

    // Root module events.
    module.event.$.pipe(takeUntil(dispose$)).subscribe(pipe);

    // Monitor child for events to bubble.
    module.event.childAdded$.pipe(takeUntil(dispose$)).subscribe((e) => {
      const child = module.find((child) => child.id === e.child.id);
      if (child) {
        const until$ = module.event.childRemoved$.pipe(
          takeUntil(dispose$),
          filter((e) => e.child.id === child.id),
        );
        child.event.$.pipe(takeUntil(until$)).subscribe(pipe);
      }
    });

    return {
      get isDisposed() {
        return dispose$.isStopped;
      },
      dispose$: dispose$.pipe(share()),
      dispose,
    };
  }

  /**
   * Construct an event helper.
   */
  public static events(subject: Observable<t.Event> | t.IModule, dispose$?: Observable<any>) {
    const event$ = (is.observable(subject)
      ? subject
      : (subject as t.IModule).event.$) as Observable<t.Event>;
    return events.create({ event$, dispose$ });
  }
}
