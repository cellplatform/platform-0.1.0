import * as React from 'react';
import { Observable } from 'rxjs';

import { ui } from './common';
import { TestDiagram } from './Test.Diagram';
import { TestSample } from './Test.Sample';
import { Test404 } from './Test.404';

import * as t from './types';

const { Module } = ui;
type V = t.MyView;

/**
 * Render factory.
 */
export function renderer(args: { bus: t.EventBus<any>; until$: Observable<any> }) {
  const { bus } = args;
  const events = Module.events<t.MyProps>(bus.event$, args.until$);

  const RootProvider = Module.provider<t.MyContext>({ bus });

  /**
   * Diagram.
   */
  events.render('DIAGRAM').subscribe((e) => {
    const el = (
      <RootProvider>
        <TestDiagram />
      </RootProvider>
    );
    e.render(el);
  });

  /**
   * Sample.
   */
  events.render('SAMPLE').subscribe((e) => {
    const el = (
      <RootProvider>
        <TestSample e={e} module={e.module} />
      </RootProvider>
    );
    e.render(el);
  });

  /**
   * Wildcard.
   */
  events.render().subscribe((e) => {
    e.render(<Test404 view={e.view} />);
  });
}
