import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { shell } from './common';
import { App } from './App';

shell
  // Register application modules.
  .main('main', () => import('./modules/main'))
  .register('Sidebar', () => import('./modules/Sidebar'))
  .register('Doc', () => import('./modules/Doc'))
  .register('Sheet', () => import('./modules/Sheet'))
  .register('Footer', () => import('./modules/Footer'))
  .initial({});

/**
 * Render into DOM.
 */
ReactDOM.render(<App />, document.getElementById('root'));
