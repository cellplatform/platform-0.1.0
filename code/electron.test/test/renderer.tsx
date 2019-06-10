import * as React from 'react';
import renderer from '@platform/electron/lib/renderer';
import { Test } from '../src/components';

/**
 * Render screen.
 */
const el = <Test />;
renderer
  .render(el, 'root', {
    getContext: async c => ({ foo: 123 }),
    devTools: { keyboard: { toggle: true, clearConsole: true } },
  })
  .then(context => {
    console.log('renderer loaded:', context); // tslint:disable-line
  })
  .catch(err => {
    /* Do something with the error */
  });
