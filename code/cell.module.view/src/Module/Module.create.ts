import { Module } from '@platform/cell.module';
import { equals } from 'ramda';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

import { t } from '../common';
import { events } from './Module.events';
import { fire } from './Module.fire';

type B = t.EventBus<any>;
type P = t.IViewModuleProps;
type N = t.IModuleNode<P>;

export function create<T extends P>(args: t.ViewModuleArgs<T>): t.IModule<T> {
  const { bus } = args;
  const module = Module.create<T>(args);

  module.change((draft, ctx) =>
    ctx.props(draft, (props) => {
      props.view = args.view || props.view;
      props.treeview = { ...props.treeview, ...args.treeview };
    }),
  );

  monitorAndDispatch<T>({ bus, module });
  return module;
}

/**
 * [Helpers]
 */

/**
 * Monitors the events of a module and bubbling
 * relevant events when matched.
 */
export function monitorAndDispatch<T extends P>(args: { bus: B; module: t.IModule<T> }) {
  const event = events<P>(args.module.event.$);
  const next = fire(args.bus);

  /**
   *  Monitor changes to the tree-view navigation selection
   *  and bubble as a module event.
   */
  event.changed$
    .pipe(
      map((e) => e.change.to.props?.treeview?.nav as NonNullable<t.ITreeviewNodeProps['nav']>),
      filter((e) => Boolean(e)),
      distinctUntilChanged((prev, next) => equals(prev, next)),
    )
    .subscribe((e) => {
      next.selection({ root: args.module.root, selected: e.selected });
    });
}
