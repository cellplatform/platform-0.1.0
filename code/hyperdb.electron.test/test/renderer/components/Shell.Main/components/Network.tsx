import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, GlamorValue, t } from '../../../common';
import { Hr, ObjectView } from '../../primitives';

export type INetworkProps = {
  network: t.INetwork;
  style?: GlamorValue;
};
export type INetworkState = {
  network?: any;
};

export class Network extends React.PureComponent<INetworkProps, INetworkState> {
  public state: INetworkState = {};
  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<INetworkState>();

  /**
   * [Lifecycle]
   */

  constructor(props: INetworkProps) {
    super(props);
    const unmounted$ = this.unmounted$;
    this.state$.pipe(takeUntil(unmounted$)).subscribe(e => this.setState(e));

    const { network } = props;
    network.events$.pipe(takeUntil(unmounted$)).subscribe(e => this.updateState());

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
    await network.ready;

    this.state$.next({
      network: {
        topic: network.topic,
        status: network.status,
        isConnected: network.isConnected,
        connection: network.connection,
      },
    });
  }

  /**
   * [Render]
   */

  public render() {
    const { network } = this.state;

    const styles = {
      base: css({
        flex: 1,
        Scroll: true,
        paddingBottom: 80,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <ObjectView name={'network'} data={this.state.network} expandLevel={3} />
        <Hr />
      </div>
    );
  }
}
