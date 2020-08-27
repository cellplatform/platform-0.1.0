import { filter, takeUntil } from 'rxjs/operators';

import { Module, rx } from './common';
import * as t from './types';
import { renderer } from './Module.render';

type E = t.HarnessEvent;
type P = t.HarnessProps;

/**
 * Behavior logic for a UIHarness.
 */
export function strategy(args: { harness: t.HarnessModule; bus: t.EventBus }) {
  const { harness } = args;
  const bus = args.bus.type<E>();

  addModuleStrategy({ harness, bus });
  renderStrategy({ harness, bus });
  selectionStrategy({ harness, bus });
}

/**
 * Add modules that register themselves to be inserted into the UIHarness.
 */
function addModuleStrategy(args: { harness: t.HarnessModule; bus: t.EventBus<E> }) {
  const { harness, bus } = args;
  const $ = bus.event$.pipe(takeUntil(harness.dispose$));
  const fire = Module.fire<P>(bus);

  rx.payload<t.IHarnessAddEvent>($, 'Harness/add')
    .pipe(filter((e) => !harness.contains(e.module)))
    .subscribe((e) => {
      const child = fire.request(e.module);
      if (child) {
        Module.register(bus, child, harness.id);
      }
    });
}

/**
 * Listens for UIHarness render requests.
 */
function renderStrategy(args: { harness: t.HarnessModule; bus: t.EventBus<E> }) {
  const { harness, bus } = args;
  const match: t.ModuleFilterEvent = (e) => e.module == harness.id;
  const events = Module.events<P>(Module.filter(bus.event$, match), harness.dispose$);
  renderer({ harness, bus, events });
}

/**
 * Listens for changes to the selected UIHarness tree item.
 */
function selectionStrategy(args: { harness: t.HarnessModule; bus: t.EventBus<E> }) {
  const { harness, bus } = args;
  const fire = Module.fire(bus);

  const match: t.ModuleFilterEvent = (e) => harness.contains(e.module);
  const events = Module.events<P>(Module.filter(bus.event$, match), harness.dispose$);

  const renderHarness = (view: t.HarnessView) => fire.render({ module: harness, view });

  events.selection$.pipe().subscribe((e) => {
    const { data } = e;
    const host = data.host;
    if (host) {
      renderHarness('HOST/component');
      fire.render({ module: e.module, data, view: host.view });
    } else {
      renderHarness('HOST/module');
      const res = fire.render({ module: e.module, data, view: e.view });
      if (!res) {
        renderHarness('404');
      }
    }

    harness.change((draft, ctx) => {
      const props = draft.props || (draft.props = {});
      const data = props.data || (props.data = {});
      data.host = host;
    });

    // TODO 🐷 - remove `selected` from [fire.render]
  });
}
