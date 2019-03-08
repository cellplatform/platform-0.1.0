import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, CommandState, t } from '../../../common';
import { ObjectView, Hr } from '../../primitives';

export type IDbStatusProps = {
  cli: CommandState;
  db: t.ITestRendererDb;
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
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    console.log('init');
    this.updateState();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Methods]
   */
  public async updateState() {
    const { db } = this.props;
    this.state$.next({
      db: {
        dir: db.dir,
        key: db.key,
        localKey: db.localKey,
        discoveryKey: db.discoveryKey,
        isAuthorized: await db.isAuthorized(),
      },
    });
  }

  /**
   * [Render]
   */

  public render() {
    // const { db } = this.props;
    const styles = { base: css({}) };

    const data = {
      db: this.state.db,
      swarm: {},
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <ObjectView name={'db'} data={data.db} expandLevel={3} />
        <Hr />
        <ObjectView name={'swarm'} data={data.swarm} expandLevel={3} />
      </div>
    );
  }
}
