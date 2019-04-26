import * as React from 'react';
import renderer from '@platform/electron/lib/renderer';
import { Test } from './client/components/Test';

export class App extends React.PureComponent {
  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;

  public render() {
    return <Test />;
  }
}

renderer.render(<App />, 'root').then(context => context.log.info('renderer loaded!'));
