import '../node_modules/@uiharness/electron/css/normalize.css';
import '@babel/polyfill';

import * as React from 'react';
import renderer from '@platform/electron/lib/renderer';
import { Test } from '../src/components';

/**
 * Render screen.
 */
const el = <Test />;
renderer
  .render(el, 'root')
  .then(context => {
    console.log('renderer loaded:', context); // tslint:disable-line
  })
  .catch(err => {
    /* Do something with the error */
  });
