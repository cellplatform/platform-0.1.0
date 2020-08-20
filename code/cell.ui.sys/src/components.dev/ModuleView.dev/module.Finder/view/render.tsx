import * as React from 'react';
import { Observable } from 'rxjs';
import { FinderImage } from './components/Image';

import { Module } from '../../common';
import * as t from '../types';

type P = t.FinderProps;

/**
 * View factory for the module.
 */
export function renderer(args: {
  bus: t.EventBus<any>;
  until$: Observable<any>;
  filter: t.ModuleFilterEvent;
}) {
  const { bus, until$ } = args;
  const event = Module.events<P>(bus.event$, until$).filter(args.filter);
  const render = event.render;

  render('DEFAULT').subscribe((e) => {
    const el = <FinderImage style={{ Absolute: 0 }} />;
    e.render(el);
  });

  /**
   * Wildcard.
   */
  render('404').subscribe((e) => {
    const el = <div style={{ padding: 20 }}>Finder (404)</div>;
    e.render(el);
  });
}
