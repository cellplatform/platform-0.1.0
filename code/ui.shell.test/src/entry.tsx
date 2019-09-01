import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { shell } from './common';
import { App } from './App';

shell
  // Register application modules.
  .register('A', () => import('./modules/A'))
  .register('B', () => import('./modules/B'))
  .default('A');

/**
 * Render into DOM.
 */
ReactDOM.render(<App />, document.getElementById('root'));
