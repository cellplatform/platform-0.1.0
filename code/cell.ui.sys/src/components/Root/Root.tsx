import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Client, css, CssValue, t } from '../../common';
import { Apps } from '../Apps';
import { WindowTitleBar } from '../primitives';
import { Server } from './Server';

export type IRootProps = { uri: string; env: t.IEnv; style?: CssValue };
export type IRootState = {};

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
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
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
      base: css({ Absolute: 0 }),
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
        padding: 30,
        Flex: 'horizontal-stretch-stretch',
      }),
      left: css({ width: 300 }),
      center: css({ flex: 1 }),
      right: css({}),
    };

    return (
      <div {...styles.base}>
        <div {...styles.left}>
          <Apps env={env} client={this.client} />
        </div>
        <div {...styles.center}>
          <div />
        </div>
        <div {...styles.right}>
          <Server env={env} client={this.client} />
        </div>
      </div>
    );
  }
}
