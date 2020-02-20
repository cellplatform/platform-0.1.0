import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue, t, util } from '../common';
import { loader } from '../loader';

export type IRootProps = { style?: CssValue };
export type IRootState = { env?: t.IEnv };

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

    // Retrieve environment API.
    const top = (window.top as unknown) as t.ITopWindow;
    if (typeof top.getEnv === 'function') {
      top.getEnv(env => this.state$.next({ env }));
    }
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const { env } = this.state;
    const styles = {
      base: css({
        Absolute: 0,
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        padding: 20,
      }),
    };

    const str = JSON.stringify(env);

    return (
      <div {...css(styles.base, this.props.style)}>
        <div>Foo</div>
        <div onClick={this.onLoadClick}>load</div>
        <div onClick={this.loadIframe}>load iframe</div>
        <div ref={this.iframeContainerRef} />
        <div>{str}</div>
      </div>
    );
  }

  private onLoadClick = async () => {
    // const url = 'http://localhost:8080/cell:sys!A1/file/Bar.42168384.js';
    // console.log('url', url);
    // console.log('window.location', window.location);

    const res = await loader.Bar();

    console.log('res', res);
    const { Bar } = res;
    const el = <Bar />;

    ReactDOM.render(el, document.getElementById('root'));
  };

  private loadIframe = () => {
    const styles = {
      base: css({
        Absolute: 50,
        border: `solid 1px ${color.format(-0.1)}`,
      }),
      iframe: css({
        Absolute: [0, null, null, 0],
        width: '100%',
        height: '100%',
      }),
    };

    const src = window.location.href;

    console.log('src', src);

    const el = (
      <div {...styles.base}>
        <iframe src={src} {...styles.iframe} frameBorder={'none'} />
      </div>
    );

    ReactDOM.render(el, this.iframeContainer);
  };
}
