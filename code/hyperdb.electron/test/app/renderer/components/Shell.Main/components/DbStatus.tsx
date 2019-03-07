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
export type IDbStatusState = {};

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
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Render]
   */

  public render() {
    const { db } = this.props;
    const styles = { base: css({}) };

    const data = {
      db: {
        key: db.key,
        localKey: db.localKey,
        discoveryKey: db.discoveryKey,
      },
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
