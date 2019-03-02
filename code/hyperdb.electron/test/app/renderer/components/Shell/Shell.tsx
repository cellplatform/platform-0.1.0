import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged, delay, debounceTime } from 'rxjs/operators';

import { css, GlamorValue, renderer, t } from '../../common';
import { DbHeader } from '../Db.Header';
import { ObjectView } from '../primitives';
import { ShellIndex, ShellIndexSelectEvent } from '../Shell.Index';
import { Dialog } from '../Dialog';

export type IShellProps = {
  style?: GlamorValue;
};

export type IShellState = {
  selected?: string; // database [dir].
  selectedDb?: t.ITestRendererDb;
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
    const { ipc } = this.context;

    const store$ = this.store.change$.pipe(takeUntil(this.unmounted$));
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
    store$.subscribe(e => this.updateState());
    this.updateState();

    state$
      // Store the currently selected database in state.
      .pipe(
        debounceTime(0),
        distinctUntilChanged(prev => prev.selected === this.selected),
      )
      .subscribe(async e => {
        const dir = `${await this.store.get('dir')}/${this.selected}`;
        const selectedDb = dir ? await renderer.getOrCreate({ ipc, dir }) : undefined;
        this.state$.next({ selectedDb });
      });
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
    this.state$.next({ selected: this.selected });
  }

  /**
   * [Render]
   */

  public render() {
    const styles = {
      base: css({
        Absolute: 0,
      }),
      body: css({
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
        <div {...styles.body}>
          <ShellIndex
            style={styles.index}
            selected={this.selected}
            onNew={this.handleNew}
            onConnect={this.handleConnect}
            onSelect={this.handleSelect}
          />
          <div {...styles.main}>{this.renderMain()}</div>
        </div>
        <Dialog />
      </div>
    );
  }

  private renderMain() {
    const { selected, store, selectedDb } = this.state;
    const data = { selected, store };
    const elHeader = selectedDb && <DbHeader key={selectedDb.key} db={selectedDb} />;
    return (
      <div>
        {elHeader}
        <ObjectView data={data} expandLevel={2} />
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
      const res = await renderer.getOrCreate({ ipc, dir, dbKey: undefined });
      this.state$.next({ selected: name });
    } catch (error) {
      log.error(error);
    }
  };

  private handleConnect = () => {
    console.log('connect');
  };

  private handleSelect = (e: ShellIndexSelectEvent) => {
    this.state$.next({ selected: e.dir });
  };
}
