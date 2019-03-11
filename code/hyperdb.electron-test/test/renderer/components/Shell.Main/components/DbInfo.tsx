import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, GlamorValue, t } from '../../../common';
import { Hr, ObjectView } from '../../primitives';

export type IDbInfoProps = {
  db: t.ITestRendererDb;
  style?: GlamorValue;
};
export type IDbInfoState = {
  db?: any;
  watching?: any;
};

export class DbInfo extends React.PureComponent<IDbInfoProps, IDbInfoState> {
  public state: IDbInfoState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<IDbInfoState>();

  /**
   * [Lifecycle]
   */

  constructor(props: IDbInfoProps) {
    super(props);
    const unmounted$ = this.unmounted$;
    this.state$.pipe(takeUntil(unmounted$)).subscribe(e => this.setState(e));

    const { db } = props;
    db.events$.pipe(takeUntil(unmounted$)).subscribe(e => this.updateState());

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
      watching: {
        current: (await db.get('.sys/watch')).value || [],
      },
    });
  }

  /**
   * [Render]
   */

  public render() {
    const styles = {
      base: css({
        flex: 1,
        Scroll: true,
        paddingBottom: 80,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <ObjectView name={'db'} data={this.state.db} expandLevel={3} />
        <Hr />
        <ObjectView name={'watching'} data={this.state.watching} expandLevel={3} />
        <Hr />
      </div>
    );
  }
}
