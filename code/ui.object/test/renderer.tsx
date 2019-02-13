import '../node_modules/@uiharness/dev/css/normalize.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Root } from '../src/components/Root';

/**
 * [Renderer] entry-point.
 *
 * Reference your component(s) here or pull in the [UIHarness]
 * visual testing host.
 */

try {
  ReactDOM.render(<Root />, document.getElementById('root'));
} catch (error) {
  /**
   * 🐷 TODO  Do something with the error, like:
   *          - log it somewhere.
   *          - alert the main process,
   *          - etc.
   */
}
