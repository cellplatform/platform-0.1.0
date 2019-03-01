import { Observable, Subject, BehaviorSubject } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
} from 'rxjs/operators';
import * as React from 'react';
import { css, color, GlamorValue, renderer, t } from '../../common';
import { ShellIndex, ShellIndexSelectEvent } from '../Shell.Index';
import { ObjectView } from '../primitives';
import { Test } from '../../Test';
import { DbHeader } from '../Db.Header';

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

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    const store$ = this.store.change$.pipe(takeUntil(this.unmounted$));
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

  /**
   * [Methods]
   */
  public async updateState() {
    const store = await this.store.read();
    this.setState({ store });
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
          selected={this.state.selected}
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
    const dir = `${values.dir}/primary-${primaryCount + 1}`;

    try {
      // Create the database.
      const res = await renderer.create({ ipc, dir, dbKey: undefined });
      const db = res.db;
      console.log('db', db);
      console.group('🌳 HyperDB (renderer)');
      console.log('- dbKey:', db.key);
      console.log('- localKey:', db.localKey);
      console.groupEnd();
    } catch (error) {
      log.error(error);
    }
  };

  private handleConnect = () => {
    console.log('connect');
  };

  private handleSelect = (e: ShellIndexSelectEvent) => {
    this.setState({ selected: e.dir });
  };
}
