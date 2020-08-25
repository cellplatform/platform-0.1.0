import * as React from 'react';
import * as t from './types';
import { ui } from './common';

type P = t.HarnessProps;

/**
 * UI: View factory for the module.
 */
export function renderer(args: { bus: t.EventBus; events: t.IViewModuleEvents<P> }) {
  const render = args.events.render;
  const fire = ui.Module.fire(args.bus);

  render('DEFAULT').subscribe((e) => {
    const el = <div style={{ padding: 20 }}>Template</div>;
    e.render(el);
  });

  /**
   * Harness tree-view selector.
   */
  render('TREE').subscribe((e) => {
    // const m =
    const module = fire.request(e.module).module;

    console.log('module //', module);

    const el = <ui.ModuleView.Tree module={module} />;

    console.log('el', el);

    e.render(el);
  });

  /**
   * Wildcard.
   */
  render('404').subscribe((e) => {
    const el = <div style={{ padding: 10 }}>Harness (404)</div>;
    e.render(el);
  });
}
