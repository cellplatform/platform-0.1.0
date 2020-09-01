import * as React from 'react';

import * as t from './types';
import { FinderImage } from './components/Image';

type P = t.FinderProps;

/**
 * View factory for the module.
 */
export function renderer(events: t.IViewModuleEvents<P>) {
  const render = events.render;

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
