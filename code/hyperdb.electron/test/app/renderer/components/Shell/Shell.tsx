import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, GlamorValue, renderer, t } from '../../common';
import { DbHeader } from '../Db.Header';
import { ObjectView } from '../primitives';
import { ShellIndex, ShellIndexSelectEvent } from '../Shell.Index';

export type IShellProps = {
  style?: GlamorValue;
};

export type IShellState = {
  selected?: string; // database [dir].
  store?: Partial<t.ITestStoreSettings>;
};

export class Shell extends React.PureComponent<IShellProps, IShellState> {
  public state: IShellState = {};
  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;
  private unmounted$ = new Subject();
  private state$ = new Subject<IShellState>();

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    const store$ = this.store.change$.pipe(takeUntil(this.unmounted$));
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
    store$.subscribe(e => this.updateState());
    this.updateState();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  private get store() {
    return this.context.store as t.ITestStore;
  }

  private get selected() {
    const { selected, store } = this.state;
    const databases = (store || {}).databases || [];
    return selected ? selected : databases[0];
  }

  /**
   * [Methods]
   */
  public async updateState() {
    const store = await this.store.read();
    this.state$.next({ store });
    this.select(this.selected);
  }

  public select(selected: string) {
    this.state$.next({ selected });
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'horizontal',
      }),
      index: css({
        position: 'relative',
        width: 180,
      }),
      main: css({
        position: 'relative',
        padding: 20,
        flex: 1,
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <ShellIndex
          style={styles.index}
          selected={this.selected}
          onNew={this.handleNew}
          onConnect={this.handleConnect}
          onSelect={this.handleSelect}
        />
        <div {...styles.main}>{this.renderMain()}</div>
      </div>
    );
  }

  private renderMain() {
    const { selected, store } = this.state;
    const data = { selected, store };
    const elHeader = selected && <DbHeader />;
    return (
      <div>
        {elHeader}
        <ObjectView data={data} />
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private handleNew = async () => {
    const { ipc, log } = this.context;

    // Prepare the new directory name for the database.
    const values = await this.store.read('dir', 'databases');
    const databases = values.databases || [];
    const primaryCount = databases.filter(name => name.startsWith('primary-')).length;
    const name = `primary-${primaryCount + 1}`;
    const dir = `${values.dir}/${name}`;

    try {
      // Create the database.
      const res = await renderer.create({ ipc, dir, dbKey: undefined });
      this.select(name);
    } catch (error) {
      log.error(error);
    }
  };

  private handleConnect = () => {
    console.log('connect');
  };

  private handleSelect = (e: ShellIndexSelectEvent) => {
    this.select(e.dir);
  };
}
