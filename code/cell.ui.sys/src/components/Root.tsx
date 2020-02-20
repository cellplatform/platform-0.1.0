import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue, t, util, Client, time } from '../common';
import { loader } from '../loader';

export type IRootProps = { style?: CssValue };
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
   * Methods
   */
  public async init(env: t.IEnv) {
    this.state$.next({ env });

    // TEMP 🐷
    const client = Client.create(env.host);
    const res = await client.info<t.IResGetElectronSysInfo>();
    console.log('info', res);

    this.state$.next({ info: res.body });

    // TEMP 🐷NOTE: this reference seems to be required to trigger the load state. Investigate!
    const f = await loader.Bar(); // TODO: Make this load the IFrame as a child compoent.
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
      }),
      ref: css({
        marginTop: 15,
        fontFamily: 'monospace',
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <div onClick={this.loadIframe}>load iframe</div>
        <pre {...styles.ref}>{JSON.stringify(env)}</pre>
        <pre {...styles.ref}>{info && JSON.stringify(info.app, null, 2)}</pre>
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

    const src = window.location.href;
    console.log('iframe.src:', src);

    const el = (
      <div {...styles.base}>
        <iframe src={src} {...styles.iframe} frameBorder={'none'} />
      </div>
    );

    ReactDOM.render(el, this.iframeContainer);
  };
}
