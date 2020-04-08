import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { HttpClient, color, COLORS, css, t, Schema } from '../../common';
import { loader } from '../../loader';
import { Button } from './../primitives';

export type IRootProps = {};
export type IRootState = {
  env?: t.IEnv;
  info?: t.IResGetElectronSysInfo;
};

export class Root extends React.PureComponent<IRootProps, IRootState> {
  public state: IRootState = {};
  private state$ = new Subject<Partial<IRootState>>();
  private unmounted$ = new Subject<{}>();

  private iframeContainer!: HTMLDivElement;
  private iframeContainerRef = (ref: HTMLDivElement) => (this.iframeContainer = ref);

  /**
   * [Lifecycle]
   */

  public async componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    // Initialize the IFrame within the window.
    const top = (window.top as unknown) as t.ITopWindow;

    console.log('top', top);
    console.log('top.getEnv', top.getEnv);

    if (typeof top.getEnv === 'function') {
      top.getEnv(env => this.init(env));
    }
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */

  public get isTop() {
    return window === window.top;
  }

  /**
   * [Methods]
   */
  public async init(env: t.IEnv) {
    this.state$.next({ env });

    // TEMP 🐷
    const client = HttpClient.create(env.host);
    const res = await client.info<t.IResGetElectronSysInfo>();
    console.log('info', res);

    this.state$.next({ info: res.body });

    // TEMP 🐷NOTE: this reference seems to be required to trigger the load state. Investigate!
    const f = await loader.Bar(); // TODO: Make this load the IFrame as a child compoent.
    console.log('f', f);
  }

  /**
   * [Render]
   */
  public render() {
    const { env, info } = this.state;
    const styles = {
      base: css({
        Absolute: 0,
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        padding: 20,
        overflow: 'hidden',
      }),
      title: css({
        Absolute: [6, 6, null, null],
        fontSize: 12,
        fontFamily: 'monospace',
        color: COLORS.CLI.MAGENTA,
      }),
      code: css({
        fontFamily: 'monospace',
        fontSize: 11,
        marginRight: 50,
      }),
      objects: css({
        Flex: 'horizontal-stretch-stetch',
        marginTop: 15,
      }),
    };

    const elLoadButton = this.isTop && <Button onClick={this.loadIframe}>load</Button>;

    return (
      <div {...styles.base}>
        <div {...styles.title}>{`<Root>`}</div>
        {elLoadButton}

        <div {...styles.objects}>
          <pre {...styles.code}>{JSON.stringify(env, null, 2)}</pre>
          {info && <pre {...styles.code}>{JSON.stringify(info.app, null, 2)}</pre>}
        </div>

        <div ref={this.iframeContainerRef} />
      </div>
    );
  }

  private loadIframe = () => {
    const styles = {
      base: css({
        Absolute: [300, 20, 20, 20],
        border: `solid 1px ${color.format(-0.1)}`,
      }),
      iframe: css({
        Absolute: [0, null, null, 0],
        width: '100%',
        height: '100%',
      }),
    };

    const { info } = this.state;
    if (!info) {
      return null;
    }

    Schema.uri.ALLOW.NS.push('sys*'); // HACK
    const urls = Schema.urls(info.domain).cell('cell:sys:A1');
    const src = urls.file.byName('sys.html').toString();

    const el = (
      <div {...styles.base}>
        <iframe src={src} {...styles.iframe} frameBorder={'none'} />
      </div>
    );

    ReactDOM.render(el, this.iframeContainer);
  };
}
