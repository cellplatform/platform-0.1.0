import * as React from 'react';

import { is, loader, log } from './common';
import * as splash from './splash';

export class App extends React.PureComponent {
  /**
   * [Lifecycle]
   */
  constructor(props: {}) {
    super(props);

    log.group('LoadShell');
    log.info('dev', is.dev);
    log.info('loadDelay', this.loadDelay);
    log.groupEnd();
  }

  public async componentDidMount() {
    // 🐷 SAMPLE: Configure after component mounted.
    //
    // const foo = await loader.load('foo');
    // this.state$.next({ foo });
    // time.delay(1500, () => {
    //   loader.add('foo', async () => {
    //     const Foo = (await import('./module.A')).Foo;
    //     return <Foo />;
    //   });
    // });
  }

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
    return (
      <loader.LoaderShell
        loader={loader.singleton}
        splash={splash.factory}
        loadDelay={this.loadDelay}
        theme={'DARK'}
      />
    );
  }
}
