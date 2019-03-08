import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { css, color, GlamorValue, CommandState, t } from '../../../common';
import { ObjectView } from '../../primitives';

const SYS_WATCH = '.sys/watch';

export type IDbWatchProps = {
  cli: CommandState;
  db: t.ITestRendererDb;
  style?: GlamorValue;
};
export type IDbWatchState = {
  watching: string[];
  values: { [key: string]: any };
};

export class DbWatch extends React.PureComponent<IDbWatchProps, IDbWatchState> {
  public state: IDbWatchState = { watching: [], values: {} };
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IDbWatchState>>();

  /**
   * [Lifecycle]
   */

  constructor(props: IDbWatchProps) {
    super(props);
    const { db } = props;
    const unmounted$ = this.unmounted$;
    const watch$ = db.watch$.pipe(takeUntil(unmounted$));
    this.state$.pipe(takeUntil(unmounted$)).subscribe(e => this.setState(e as IDbWatchState));

    // Update the component when the system-watch configuration changes.
    watch$.pipe(filter(e => e.key === SYS_WATCH)).subscribe(e => this.updateWatchedKeys());
    this.updateWatchedKeys();
    db.watch(SYS_WATCH);

    // Update screen when watched keys change.
    watch$.pipe(filter(e => !e.key.startsWith('.sys/'))).subscribe(e => {
      const values = { ...this.state.values, [e.key]: e.value };
      this.state$.next({ values });
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  public get values() {
    const values = { ...this.state.values };
    Object.keys(values)
      .filter(key => !Boolean(key))
      .forEach(key => delete values[key]);
    return values;
  }

  /**
   * [Methods]
   */
  public async updateWatchedKeys() {
    const { db } = this.props;
    const watching = (await db.get('.sys/watch')).value || [];
    this.state$.next({ watching });
    db.watch(...watching);
    this.readWatchedValues();
  }

  public async readWatchedValues() {
    const { db } = this.props;
    const { watching } = this.state;

    console.log(
      `\nTODO 🐷   getAll method on DB - to do the following set in one line of code. \n`,
    );

    // Read the value of each watched key.
    const items = await Promise.all(
      watching.map(async key => {
        const { value } = await db.get(key as any);
        return { key, value };
      }),
    );

    // Store values in the component state.
    let values = {};
    items
      .filter(({ key }) => !key.startsWith('.sys/'))
      .filter(({ key }) => Boolean(key))
      .forEach(({ key, value }) => {
        values = { ...values, [key]: value };
      });

    this.state$.next({ values });
  }

  /**
   * [Render]
   */

  public render() {
    const styles = { base: css({}) };
    return (
      <div {...css(styles.base, this.props.style)}>
        <ObjectView name={'watching'} data={this.values} expandLevel={3} />
      </div>
    );
  }
}
