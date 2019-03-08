import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, CommandState, t } from '../../../common';
import { ObjectView, Hr } from '../../primitives';

export type IDbStatusProps = {
  cli: CommandState;
  db: t.ITestRendererDb;
  network?: t.INetwork;
  style?: GlamorValue;
};
export type IDbStatusState = {
  db?: {
    dir: string;
    key: string;
    localKey: string;
    discoveryKey: string;
    isAuthorized: boolean;
  };
  swarm?: any;
};

export class DbStatus extends React.PureComponent<IDbStatusProps, IDbStatusState> {
  public state: IDbStatusState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<IDbStatusState>();

  /**
   * [Lifecycle]
   */

  constructor(props: IDbStatusProps) {
    super(props);
    const unmounted$ = this.unmounted$;
    this.state$.pipe(takeUntil(unmounted$)).subscribe(e => this.setState(e));

    const { db, network } = props;
    db.events$.pipe(takeUntil(unmounted$)).subscribe(e => this.updateState());
    // network.events$.pipe(takeUntil(unmounted$)).subscribe(e => this.updateState());

    this.updateState();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Methods]
   */
  public async updateState() {
    const { db, network } = this.props;

    const swarm = network && {
      topic: network.topic,
      status: network.status,
      isConnected: network.isConnected,
      connection: network.connection,
    };

    this.state$.next({
      db: {
        dir: db.dir,
        key: db.key,
        localKey: db.localKey,
        discoveryKey: db.discoveryKey,
        isAuthorized: await db.isAuthorized(),
      },
      swarm: swarm,
    });
  }

  /**
   * [Render]
   */

  public render() {
    const styles = { base: css({}) };
    return (
      <div {...css(styles.base, this.props.style)}>
        <ObjectView name={'db'} data={this.state.db} expandLevel={3} />
        <Hr />
        <ObjectView name={'swarm'} data={this.state.swarm} expandLevel={3} />
      </div>
    );
  }
}
