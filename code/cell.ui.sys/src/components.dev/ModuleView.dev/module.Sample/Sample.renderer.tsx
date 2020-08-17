import * as React from 'react';
import { Observable } from 'rxjs';

import { ui } from '../common';
import { TestDiagram } from './components/Diagram';
import { TestSample } from './components/Sample';
import { Test404 } from './components/404';

import * as t from '../types';

const { Module } = ui;
type V = t.MyView;

/**
 * Render factory.
 */
export function renderer(args: { bus: t.EventBus<any>; until$: Observable<any> }) {
  const { bus, until$ } = args;
  const events = Module.events<t.MyProps>(bus.event$, until$);
  const fire = Module.fire(bus);

  const RootProvider = Module.provider<t.MyContext>({ bus });

  /**
   * Diagram.
   */
  events.render('DIAGRAM').subscribe((e) => {
    const module = fire.request(e.module).module; // Sample of getting module and pass as prop.
    const el = (
      <RootProvider>
        <TestDiagram module={module} />
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
        <TestSample module={e.module} selected={e.selected} />
      </RootProvider>
    );
    e.render(el);
  });

  /**
   * Wildcard.
   */
  events.render('404').subscribe((e) => {
    e.render(<Test404 view={e.view} />);
  });
}
