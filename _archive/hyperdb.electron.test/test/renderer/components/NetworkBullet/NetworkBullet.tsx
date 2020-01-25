import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { color, css, CssValue, t } from '../../common';

const BULLET_SIZE = 10;

export type INetworkBulletProps = {
  db: t.IDb;
  network: t.INetwork;
  style?: CssValue;
};
export type INetworkBulletState = {
  isConnected?: boolean;
};

export class NetworkBullet extends React.PureComponent<INetworkBulletProps, INetworkBulletState> {
  public state: INetworkBulletState = {};
  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<Partial<INetworkBulletState>>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    const { network } = this.props;
    network.events$
      .pipe(
        takeUntil(this.unmounted$),
        filter(e => e.type === 'NETWORK/connection'),
      )
      .subscribe(e => {
        this.updateState();
        this.forceUpdate();
      });

    this.updateState();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Methods]
   */
  public async updateState() {
    const { network } = this.props;
    const isConnected = network.isConnected;
    this.state$.next({ isConnected });
  }

  /**
   * [Render]
   */
  public render() {
    const { isConnected } = this.state;
    const styles = {
      base: css({
        width: BULLET_SIZE,
        height: BULLET_SIZE,
        borderRadius: BULLET_SIZE,
        backgroundColor: color.format(0.2),
        backgroundImage: isConnected
          ? `linear-gradient(-180deg, #70EB07 0%, #35AF06 100%)`
          : undefined,
        border: `solid 1px ${color.format(1)}`,
        boxSizing: 'border-box',
      }),
    };
    return <div {...css(styles.base, this.props.style)} />;
  }
}
