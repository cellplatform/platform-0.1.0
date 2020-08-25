import * as React from 'react';

import { ui, t } from '../common';
import { TestDiagram } from './components/Diagram';
import { TestSample } from './components/Sample';
import { Test404 } from './components/404';
import { TreeColumns } from './components/TreeColumns';

const { Module } = ui;

type P = t.MyProps;

/**
 * Render factory.
 */
export function renderer(args: { bus: t.EventBus; events: t.IViewModuleEvents<P> }) {
  const { bus, events } = args;
  const render = events.render;

  const fire = Module.fire(bus);
  const RootProvider = ui.Module.provider<t.MyContext>({ bus });

  /**
   * Diagram.
   */
  render('DIAGRAM').subscribe((e) => {
    // NB: Sample of getting the module and passing as a prop (rather than using a <Provider>).
    const module = fire.request(e.module).module;
    const el = <TestDiagram module={module} />;
    e.render(el);
  });

  /**
   * Sample.
   */
  render('SAMPLE').subscribe((e) => {
    const el = (
      <RootProvider>
        <TestSample module={e.module} selected={e.selected} />
      </RootProvider>
    );
    e.render(el);
  });

  /**
   * Tree Columns.
   */
  render('TREE_COLUMNS').subscribe((e) => {
    const el = (
      <RootProvider>
        <TreeColumns module={e.module} />
      </RootProvider>
    );
    e.render(el);
  });

  /**
   * Wildcard.
   */
  events.render('404').subscribe((e) => {
    e.render(<Test404 view={e.view} module={e.module} selected={e.selected} />);
  });
}
