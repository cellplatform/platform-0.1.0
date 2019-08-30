import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { is, loader, log } from './common';
import * as splash from './splash';

export type ITestProps = {};
export type ITestState = {};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {};
  private state$ = new Subject<Partial<ITestState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: ITestProps) {
    super(props);
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));

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

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
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
