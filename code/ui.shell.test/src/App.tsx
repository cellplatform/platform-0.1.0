import * as React from 'react';

import { is, shell } from './common';
import * as splash from './splash';

export class App extends React.PureComponent {
  /**
   * [Properties]
   */
  private get loadDelay() {
    const delay = is.dev ? 1500 : 500; // NB: Simulate latency.
    return delay;
  }

  /**
   * [Render]
   */
  public render() {
    return <shell.Loader splash={splash.factory} theme={'DARK'} loadDelay={this.loadDelay} />;
  }
}
