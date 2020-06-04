import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, Client, css, CssValue, t } from '../../common';
import { Apps, AppClickEvent, IAppData } from '../Apps';
import { ObjectView, WindowTitleBar } from '../primitives';
import { Server } from './Server';

export type IRootProps = { uri: string; env: t.IEnv; style?: CssValue };
export type IRootState = {
  json?: IAppData;
};

export class Root extends React.PureComponent<IRootProps, IRootState> {
  public state: IRootState = {};
  private state$ = new Subject<Partial<IRootState>>();
  private unmounted$ = new Subject<{}>();
  private client = Client.typesystem(this.props.env.host);

  /**
   * [Lifecycle]
   */
  constructor(props: IRootProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const { uri } = this.props;

    const styles = {
      base: css({
        Absolute: 0,
      }),
      titlebar: css({ Absolute: [0, 0, null, 0] }),
      body: css({
        Absolute: [WindowTitleBar.HEIGHT, 0, 0, 0],
        display: 'flex',
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <WindowTitleBar style={styles.titlebar} address={uri} />
        <div {...styles.body}>
          {this.renderBody()}
          <div />
        </div>
      </div>
    );
  }

  private renderBody() {
    const { env } = this.props;
    const styles = {
      base: css({
        flex: 1,
        Flex: 'horizontal-stretch-stretch',
        boxSizing: 'border-box',
      }),
      left: css({
        width: 260,
        paddingTop: 30,
        paddingLeft: 30,
        paddingRight: 50,
        paddingBottom: 80,
        Scroll: true,
      }),
      center: css({
        flex: 1,
        display: 'flex',
      }),
      right: css({
        paddingTop: 30,
        paddingRight: 30,
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.left}>
          <Apps env={env} client={this.client} onAppClick={this.onAppClick} />
        </div>
        <div {...styles.center}>{this.renderCenter()}</div>
        <div {...styles.right}>
          <Server env={env} client={this.client} />
        </div>
      </div>
    );
  }

  private renderCenter() {
    const { json } = this.state;
    const MARGIN_LEFT = 0;

    const styles = {
      base: css({
        flex: 1,
        position: 'relative',
      }),
      margin: css({
        Absolute: [0, null, 0, 0],
        borderLeft: `solid 1px #EF3469`,
        opacity: 0.4,
      }),
      margin1: css({ left: MARGIN_LEFT }),
      margin2: css({ left: MARGIN_LEFT + 2 }),
      body: css({
        Absolute: [0, 0, 0, MARGIN_LEFT + 30],
        overflow: 'auto',
        paddingTop: 30,
      }),
    };

    const data = json && {
      typename: json?.typename,
      props: json?.props,
      types: json?.types,
      raw: json,
    };

    return (
      <div {...styles.base}>
        <div {...css(styles.margin, styles.margin1)} />
        <div {...css(styles.margin, styles.margin2)} />
        <div {...styles.body}>
          {data && <ObjectView data={data} expandPaths={['$', '$.props']} />}
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private onAppClick = (e: AppClickEvent) => {
    this.state$.next({ json: e.app });
  };
}
