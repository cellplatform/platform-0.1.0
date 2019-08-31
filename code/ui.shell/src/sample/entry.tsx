import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { shell } from './common';
import { Test } from './Test';

shell
  // Register application modules.
  .register('A', () => import('./modules/A'))
  .register('B', () => import('./modules/B'))
  .default('A');

/**
 * Render into DOM.
 */
ReactDOM.render(<Test />, document.getElementById('root'));
