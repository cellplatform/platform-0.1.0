import * as React from 'react';
import renderer from '@platform/electron/lib/renderer';
// import { Test } from '../components/Test';
import { Button } from '../common';

/**
 * [Note] example <App> root provides access to the
 * electron context properties passed down via <Provider>
 * that is injected within `renderer.render(...)`.
 */
export class App extends React.PureComponent {
  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;

  public render() {
    return (
      <div>
        <Button>Two</Button>
      </div>
    );
  }
}

/**
 * [Renderer] entry-point.
 *
 * Reference your component(s) here or pull in the [UIHarness]
 * visual testing host.
 */
renderer.render(<App />, 'root').then(context => context.log.info('renderer loaded!'));
