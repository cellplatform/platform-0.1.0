import { Module } from '@platform/cell.module';
import { Observable } from 'rxjs';
import { filter, share } from 'rxjs/operators';

import { rx, t } from '../common';

type B = t.EventBus<any>;
type P = t.IViewModuleProps;
type N = t.IModuleNode<P>;

export function events<T extends P>(
  subject: Observable<t.Event> | t.IModule,
  until$?: Observable<any>,
): t.IViewModuleEvents<T> {
  const events = Module.events<T>(subject, until$);
  // const dispose$ = dis
  const $ = events.$;

  const selection$ = rx.payload<t.IModuleSelectionEvent<T>>($, 'Module/ui/selection').pipe(share());
  const render$ = rx.payload<t.IModuleRenderEvent<T>>($, 'Module/ui/render').pipe(share());
  const rendered$ = rx.payload<t.IModuleRenderedEvent>($, 'Module/ui/rendered').pipe(share());

  return {
    ...events,
    selection$,
    render$,
    rendered$,

    /**
     * Filters on render requests for the given view, only returning
     * matching events that have not yet been handled.
     */
    render(view) {
      return render$.pipe(
        filter((e) => !e.handled),
        filter((e) => (view === undefined ? true : e.view === view)),
      );
    },
  } as t.IViewModuleEvents<T>;
}
