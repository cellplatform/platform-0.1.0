import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { LoadShell } from '..';
import { color, COLORS, css, GlamorValue, t, time, is, log } from '../common';
import { loader } from './loader';

export type ITestProps = { style?: GlamorValue };
export type ITestState = { foo?: JSX.Element };

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
    // TEMP 🐷
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
      <LoadShell
        loader={loader}
        splash={this.splashFactory}
        theme={'DARK'}
        loadDelay={this.loadDelay}
      />
    );
  }

  private splashFactory: t.SplashFactory = args => {
    const { theme, type } = args;
    const filename = theme === 'LIGHT' ? 'acme-dark' : 'acme-light';
    const logo = [`/images/logo/${filename}.png`, `/images/logo/${filename}@2x.png`, 169, 32];

    // if (type === 'TOP_LEFT') {
    //   const style = css({ Image: logo, marginLeft: 15, marginTop: 10 });
    //   return <div {...style} />;
    // }

    // if (type === 'TOP_RIGHT') {
    //   const style = css({ Image: logo, marginRight: 15, marginTop: 10 });
    //   return <div {...style} />;
    // }

    if (type === 'BOTTOM_LEFT') {
      const style = css({
        marginLeft: 10,
        marginBottom: 10,
        fontSize: 14,
        opacity: 0.4,
        color: theme === 'DARK' ? COLORS.WHITE : COLORS.DARK,
        userSelect: 'none',
      });
      const message = `© ${new Date().getFullYear()}, Acme Inc.`;
      return <div {...style}>{message}</div>;
    }

    if (type === 'BOTTOM_RIGHT') {
      const style = css({ Image: logo, marginRight: 20, marginBottom: 18 });
      return <div {...style} />;
    }

    return undefined;
  };
}
