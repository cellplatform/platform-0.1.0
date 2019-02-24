import '@babel/polyfill';
import '../node_modules/@uiharness/electron/css/normalize.css';

import * as React from 'react';
import { renderer } from '@platform/electron/lib/renderer';
import { Test } from '../src/components/Test';

/**
 * [Note] example <App> root provides access to the
 * electron context properties passed down via <Provider>
 * that is injected within `renderer.render(...)`.
 */
export class App extends React.PureComponent {
  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;

  public render() {
    return <App />;
  }
}

/**
 * [Renderer] entry-point.
 *
 * Reference your component(s) here or pull in the [UIHarness]
 * visual testing host.
 */
renderer.render(<Test />, 'root').then(context => context.log.info('renderer loaded!'));
