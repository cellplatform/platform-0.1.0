import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { HttpClient, color, COLORS, css, t, Schema } from '../../common';
import { loader } from '../../loader';
import { Button } from './../primitives';

const DARK = '#202124';
const PINK = '#FE0168';

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

    this.loadIframe();
  }

  /**
   * [Render]
   */
  public render() {
    // const { env, info } = this.state;
    const styles = {
      base: css({
        Absolute: 0,
        backgroundColor: DARK,
        color: COLORS.WHITE,
        // padding: 20,
        overflow: 'hidden',
        Flex: 'vertical-stretch-stretch',
      }),
      header: css({
        position: 'relative',
        height: 40,
        borderBottom: `solid 1px ${color.format(0.2)}`,
      }),
      body: css({
        flex: 1,
        position: 'relative',
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.header}>{this.renderHeader()}</div>
        <div {...styles.body} ref={this.iframeContainerRef}>
          body
        </div>
      </div>
    );
  }

  private renderHeader() {
    const styles = {
      base: css({
        Flex: 'horizontal-stretch-stretch',
        boxSizing: 'border-box',
        Absolute: 0,
        userSelect: 'none',
        WebkitAppRegion: 'drag',
      }),
      left: css({
        flex: 1,
      }),
      right: css({
        width: 135,
        boxSizing: 'border-box',
        backgroundColor: PINK,
        Flex: 'center-end',
        padding: 10,
        fontWeight: 'bold',
        fontSize: 26,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.left}>
          <div />
        </div>
        <div {...styles.right}>
          <div>A1</div>
        </div>
      </div>
    );
  }

  private loadIframe = () => {
    console.log('-------------------------------------------');

    const styles = {
      base: css({
        // Absolute: [0, 5, 5, 5],
        Absolute: 0,
        border: `solid 1px ${color.format(-0.1)}`,
      }),
      iframe: css({
        Absolute: [0, null, null, 0],
        width: '100%',
        height: '100%',
      }),
    };

    const { info, env } = this.state;
    if (!info || !env) {
      return null;
    }

    const rowUri = Schema.uri.parse<t.IRowUri>(env.def.uri).parts;
    const cellUri = Schema.uri.create.cell(rowUri.ns, 'A1');

    const urls = Schema.urls(info.domain).cell(cellUri);
    const src = urls.file.byName('ui.ide/entry.html').toString();

    console.log('src', src);

    // console.log('src1', src1);

    // const src = 'http://localhost:1234/';
    // const src = 'http://localhost:5000/';

    const el = (
      <div {...styles.base}>
        <iframe src={src} {...styles.iframe} frameBorder={'none'} />
      </div>
    );

    ReactDOM.render(el, this.iframeContainer);
  };
}
