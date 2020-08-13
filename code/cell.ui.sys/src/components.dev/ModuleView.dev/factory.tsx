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
export function renderer(args: {
  fire: t.FireEvent<any>;
  event$: Observable<t.Event>;
  until$: Observable<any>;
}) {
  const events = Module.events<t.MyProps>(args.event$, args.until$);

  const RootProvider = Module.provider<t.MyContext>({
    event$: events.$,
    fire: args.fire,
  });

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
