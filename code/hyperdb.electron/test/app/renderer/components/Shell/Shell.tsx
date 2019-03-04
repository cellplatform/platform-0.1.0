import * as React from 'react';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { color, css, GlamorValue, renderer, t, CommandState, Command, COLORS } from '../../common';
import { DbHeader } from '../Db.Header';
import { JoinDialog } from '../Dialog.Join';
import { JoinWithKeyEvent } from '../Dialog.Join/types';
import { ObjectView } from '../primitives';
import { ShellIndex, ShellIndexSelectEvent } from '../Shell.Index';

import { CommandPrompt } from '../CommandPrompt';

export type IShellProps = {
  style?: GlamorValue;
};

export type IShellState = {
  dialog?: 'JOIN';
  selected?: string; // database [dir].
  selectedDb?: t.ITestRendererDb;
  store?: Partial<t.ITestStoreSettings>;
};

const root = Command.create('hyperdb')
  .add('get')
  .add('put')
  .add('watch');

export class Shell extends React.PureComponent<IShellProps, IShellState> {
  public state: IShellState = {};
  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IShellState>>();
  private cli = CommandState.create({ root });

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    const { ipc } = this.context;

    const cliChange$ = this.cli.change$.pipe(takeUntil(this.unmounted$));
    const cliInvoke$ = this.cli.invoke$.pipe(takeUntil(this.unmounted$));
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
        const selected = this.selected;
        const dir = selected ? `${await this.store.get('dir')}/${selected}` : undefined;
        const selectedDb = dir ? await renderer.getOrCreate({ ipc, dir }) : undefined;
        this.state$.next({ selectedDb });
      });

    cliChange$.subscribe(e => {
      const { command, text, params } = e;

      // console.group('🌳 change');
      // console.log('text', text);
      // console.log('params', params);
      // console.log('command', command);
      // console.groupEnd();
      this.forceUpdate();
    });

    cliInvoke$.subscribe(e => {
      const { command, text, args } = e;
      console.group('🌳 invoke');
      console.log('text', text);
      console.log('args', args);
      console.log('command', command);
      console.groupEnd();
      // this.forceUpdate();
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

  private async createDatabase(args: { dbKey?: string }) {
    const { ipc, log } = this.context;
    const { dbKey } = args;
    const prefix = dbKey ? 'peer' : 'primary';

    // Prepare the new directory name for the database.
    const values = await this.store.read('dir', 'databases');
    const databases = values.databases || [];
    const primaryCount = databases.filter(name => name.startsWith(`${prefix}-`)).length;
    const name = `${prefix}-${primaryCount + 1}`;
    const dir = `${values.dir}/${name}`;

    try {
      // Create the database.
      await renderer.getOrCreate({ ipc, dir, dbKey });
      this.state$.next({ selected: name });
    } catch (error) {
      log.error(error);
    }
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
        flex: 1,
        display: 'flex',
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.body}>
          <ShellIndex
            style={styles.index}
            selected={this.selected}
            onNew={this.handleNew}
            onConnect={this.handleJoinStart}
            onSelect={this.handleSelect}
          />
          <div {...styles.main}>{this.renderMain()}</div>
        </div>
        {this.renderDialog()}
      </div>
    );
  }

  private renderMain() {
    const { selected, store, selectedDb } = this.state;
    const db = selectedDb ? { key: selectedDb.key, localKey: selectedDb.localKey } : {};
    const data = { selected, store, db };

    const styles = {
      base: css({
        flex: 1,
        Flex: 'vertical',
      }),
      body: css({
        flex: 1,
        padding: 20,
      }),
      footer: css({
        position: 'relative',
        backgroundColor: COLORS.DARK,
      }),
    };

    const elHeader = selectedDb && <DbHeader key={selectedDb.key} db={selectedDb} />;
    return (
      <div {...styles.base}>
        <div {...styles.body}>
          {elHeader}
          <ObjectView data={data} expandLevel={2} />
        </div>
        <div {...styles.footer}>
          <CommandPrompt focusOnKeypress={true} text={this.cli.text} onChange={this.cli.onChange} />
        </div>
      </div>
    );
  }

  private renderDialog() {
    const { dialog } = this.state;
    switch (dialog) {
      case 'JOIN':
        return <JoinDialog onClose={this.clearDialog} onJoin={this.handleJoinComplete} />;
    }
    return null;
  }

  /**
   * [Handlers]
   */

  private handleNew = async () => {
    await this.createDatabase({ dbKey: undefined });
  };

  private handleJoinStart = () => {
    this.state$.next({ dialog: 'JOIN' });
  };

  private handleJoinComplete = (e: JoinWithKeyEvent) => {
    const { dbKey } = e;
    this.createDatabase({ dbKey });
    this.clearDialog();
  };

  private handleSelect = (e: ShellIndexSelectEvent) => {
    this.state$.next({ selected: e.dir });
  };

  private clearDialog = () => {
    this.state$.next({ dialog: undefined });
  };
}
