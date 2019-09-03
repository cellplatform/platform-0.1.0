import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { shell } from './common';
import { App } from './App';

shell
  // Register application modules.
  .main('main', () => import('./modules/main'))
  .register('sidebar', () => import('./modules/Sidebar'))
  .register('doc', () => import('./modules/Doc'))
  .register('sheet', () => import('./modules/Sheet'));
  .initial({ sidebar: { background: 'red' } });

/**
 * Render into DOM.
 */
ReactDOM.render(<App />, document.getElementById('root'));
