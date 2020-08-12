import * as React from 'react';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { ui } from '../../common';
import { TestDiagram } from './Test.Diagram';
import { TestSample } from './Test.Sample';
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
  const events = Module.events(args.event$, args.until$);
  const render$ = events.render$.pipe(
    filter((e) => !e.handled),
    map((e) => ({ view: e.view as V, event: e, render: e.render })),
  );

  const RootProvider = Module.provider<t.MyContext>({
    event$: events.$,
    fire: args.fire,
  });

  /**
   * Diagram.
   */
  render$.pipe(filter((e) => e.view === 'DIAGRAM')).subscribe((e) => {
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
  render$.pipe(filter((e) => e.view === 'SAMPLE')).subscribe((e) => {
    const el = (
      <RootProvider>
        <TestSample e={e.event} module={e.event.module} />
      </RootProvider>
    );
    e.render(el);
  });

  /**
   * Wildcard.
   */
  render$.subscribe((e) => {
    e.render(<div>View Not Found: {e.view}</div>);
  });
}
