import '../node_modules/@uiharness/dev/css/normalize.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Test } from '../src/components';
import { renderer, log } from '../src/common';

renderer.init();

try {
  const el = <Test />;
  ReactDOM.render(el, document.getElementById('root'));
} catch (error) {
  log.error('Load failed: ', error.message);
}
