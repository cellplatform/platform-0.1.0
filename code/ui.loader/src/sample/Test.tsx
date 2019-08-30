import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, COLORS, css, GlamorValue, is, log, t, loader, time } from './common';

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
      <loader.Shell
        loader={loader.singleton}
        splash={this.splashFactory}
        loadDelay={this.loadDelay}
        theme={'DARK'}
      />
    );
  }

  private splashFactory: t.SplashFactory = args => {
    const { theme, type } = args;
    const filename = theme === 'LIGHT' ? 'acme-dark' : 'acme-light';
    const logo = [`/images/logo/${filename}.png`, `/images/logo/${filename}@2x.png`, 169, 32];

    const attr = (tag: string, key: string) => {
      return is.browser ? document.getElementsByTagName(tag)[0].getAttribute(key) : '';
    };

    const renderText = (args: { text: string; margin?: string }) => {
      const style = css({
        margin: args.margin || 10,
        fontSize: 14,
        opacity: 0.4,
        color: theme === 'DARK' ? COLORS.WHITE : COLORS.DARK,
        userSelect: 'none',
      });
      return <div {...style}>{args.text}</div>;
    };

    if (type === 'TOP:LEFT') {
      const version = attr('html', 'data-size') || '- KB';
      const text = `size ${version}`;
      return renderText({ text });
    }

    if (type === 'TOP:RIGHT') {
      const version = attr('html', 'data-version') || '-';
      const text = `version ${version}`;
      return renderText({ text });
    }

    if (type === 'BOTTOM:LEFT') {
      const text = `© ${new Date().getFullYear()}, Acme Inc.`;
      return renderText({ text });
    }

    if (type === 'BOTTOM:RIGHT') {
      const style = css({ Image: logo, marginRight: 20, marginBottom: 18 });
      return <div {...style} />;
    }

    return undefined;
  };
}
