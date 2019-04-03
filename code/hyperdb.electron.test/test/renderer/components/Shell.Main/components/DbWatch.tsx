import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { css, GlamorValue, renderer, t } from '../../../common';
import { Hr, ObjectView } from '../../primitives';

const SYS_WATCH = '.sys/watch';

export type IDbWatchProps = {
  db: t.ITestRendererDb;
  style?: GlamorValue;
};
export type IDbWatchState = {
  watchingKeys: string[];
  watchedValues: { [key: string]: any };
  values?: { [key: string]: any };
};

export class DbWatch extends React.PureComponent<IDbWatchProps, IDbWatchState> {
  public state: IDbWatchState = { watchingKeys: [], watchedValues: {} };
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IDbWatchState>>();

  public static contextType = renderer.Context;
  public context!: t.ITestRendererContext;

  /**
   * [Lifecycle]
   */

  public componentWillMount() {
    const { db } = this.props;
    const watch$ = db.watch$.pipe(takeUntil(this.unmounted$));
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e as IDbWatchState));
    const command$ = this.cli.events$.pipe(takeUntil(this.unmounted$));

    // Update the component when the system-watch configuration changes.
    watch$.pipe(filter(e => e.key === SYS_WATCH)).subscribe(e => this.updateWatchedKeys());
    this.updateWatchedKeys();
    db.watch(SYS_WATCH);
    db.watch('cell');

    // Update screen when watched keys change.
    watch$.pipe(filter(e => !e.key.startsWith('.sys/'))).subscribe(e => {
      const values = { ...this.state.watchedValues, [e.key]: e.value.to };
      this.state$.next({ watchedValues: values });
    });

    // Listen for explicit values object passed from command.
    command$
      .pipe(
        filter(e => e.type === 'CLI/db/values'),
        map(e => e as t.ITestDbValuesEvent),
      )
      .subscribe(e => {
        this.state$.next({ values: e.payload.values });
      });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  private get cli() {
    return this.context.cli;
  }

  public get watchedValues() {
    const values = { ...this.state.watchedValues };
    Object.keys(values)
      .filter(key => !Boolean(key))
      .forEach(key => delete values[key]);

    Object.keys(values)
      .filter(key => typeof values[key] === 'string')
      .map(key => ({ key, value: values[key] as string }))
      .filter(({ value }) => value.length > 64)
      .forEach(({ key, value }) => (values[key] = `${value.substr(0, 64)}...`));

    Object.keys(values)
      .filter(key => !Boolean(values[key]))
      .forEach(key => delete values[key]);

    return values;
  }

  /**
   * [Methods]
   */
  public async updateWatchedKeys() {
    const { db } = this.props;
    const watching = (await db.get('.sys/watch')).value || [];
    this.state$.next({ watchingKeys: watching });
    db.watch(...watching);
    this.readWatchedValues();
  }

  public async readWatchedValues() {
    const { db } = this.props;
    const { watchingKeys: watching } = this.state;

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

    this.state$.next({ watchedValues: values });
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

    const elValues = this.state.values && (
      <div>
        <Hr />
        <ObjectView name={'values'} data={this.state.values} expandLevel={1} />
      </div>
    );

    return (
      <div {...css(styles.base, this.props.style)}>
        <ObjectView name={'data'} data={this.watchedValues} expandLevel={3} />
        {elValues}
      </div>
    );
  }
}
