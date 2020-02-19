import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { t, log } from './common';

export const VIEWS: t.View[] = [
  { name: 'invite 1', load: () => import('./components/Invite') as any },
];

/**
 * Dymamically load a view module.
 */
export async function loadModule(view: t.View) {
  try {
    log.info('loading view:', view.name);
    const res = await view.load();
    log.info('loaded', res);

    const el = <res.default />;
    ReactDOM.render(el, document.getElementById('root'));
  } catch (error) {
    console.log('error', error);
  }
}
