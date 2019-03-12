import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, GlamorValue, t, renderer } from '../../../common';
import { Hr, ObjectView } from '../../primitives';

export type IInfoProps = {
  db?: t.ITestRendererDb;
  style?: GlamorValue;
};
export type IInfoState = {
  db?: any;
  watching?: any;
  store?: any;
};

export class Info extends React.PureComponent<IInfoProps, IInfoState> {
  public state: IInfoState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<IInfoState>();
  public static contextType = renderer.Context;
  public context!: t.ITestRendererContext;

  /**
   * [Lifecycle]
   */

  public componentWillMount() {
    const unmounted$ = this.unmounted$;
    this.state$.pipe(takeUntil(unmounted$)).subscribe(e => this.setState(e));

    const { db } = this.props;
    if (db) {
      db.events$.pipe(takeUntil(unmounted$)).subscribe(e => this.updateState());
    }

    this.updateState();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Methods]
   */
  public async updateState() {
    const { db: d } = this.props;
    const store = await this.context.store.read();

    const db = !d
      ? { message: 'No database to view. Try creating one by typing `new` in the command line.' }
      : {
          dir: d.dir,
          key: d.key,
          localKey: d.localKey,
          discoveryKey: d.discoveryKey,
          isAuthorized: await d.isAuthorized(),
        };

    const watching = !d
      ? undefined
      : {
          current: (d && (await d.get('.sys/watch')).value) || [],
        };

    this.state$.next({
      db,
      watching,
      store,
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

    console.log('this.state', this.state);
    return (
      <div {...css(styles.base, this.props.style)}>
        <ObjectView name={'db'} data={this.state.db} expandLevel={3} />
        <Hr />
        <ObjectView name={'watching'} data={this.state.watching} expandLevel={3} />
        <Hr />
        <ObjectView name={'store'} data={this.state.store} expandLevel={3} />
        <Hr />
      </div>
    );
  }
}
