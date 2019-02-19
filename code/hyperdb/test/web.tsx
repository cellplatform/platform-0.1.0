import '../node_modules/@uiharness/dev/css/normalize.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Test } from '../src/components/Test';

/**
 * [Web] entry-point.
 *
 * Reference your component(s) here or pull in the [UIHarness]
 * visual testing host.
 */
ReactDOM.render(<Test />, document.getElementById('root'));
