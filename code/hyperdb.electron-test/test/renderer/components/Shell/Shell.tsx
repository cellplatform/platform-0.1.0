import * as React from 'react';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';

import { COLORS, css, GlamorValue, ICommand, renderer, str, t } from '../../common';
import { CommandPrompt } from '../cli.CommandPrompt';
import { JoinDialog } from '../Dialog.Join';
import { JoinWithKeyEvent } from '../Dialog.Join/types';
import { ShellIndex, ShellIndexSelectEvent } from '../Shell.Index';
import { ShellMain } from '../Shell.Main';

export type IShellProps = {
  style?: GlamorValue;
};

export type IShellState = {
  dialog?: 'JOIN';
  selected?: string; // database [dir].
  selectedDb?: t.ITestRendererDb;
  selectedNetwork?: t.INetworkRenderer;
  store?: Partial<t.ITestStoreSettings>;
};

export class Shell extends React.PureComponent<IShellProps, IShellState> {
  public state: IShellState = {};
  public static contextType = renderer.Context;
  public context!: t.ITestRendererContext;
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IShellState>>();
  private commandPrompt: CommandPrompt | undefined;
  private commandPromptRef = (ref: CommandPrompt) => (this.commandPrompt = ref);

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    const unmounted$ = this.unmounted$;
    const store$ = this.store.change$.pipe(takeUntil(unmounted$));
    const state$ = this.state$.pipe(takeUntil(unmounted$));
    const cli$ = this.cli.state.change$.pipe(takeUntil(unmounted$));
    const commandEvents$ = this.cli.events$.pipe(takeUntil(unmounted$));

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
        const db = this.context.db;
        const res = dir ? await db.getOrCreate({ dir }) : undefined;
        const selectedDb = res ? (res.db as t.ITestRendererDb) : undefined;
        const selectedNetwork = res ? res.network : undefined;
        this.state$.next({ selectedDb, selectedNetwork });
      });

    // Redraw screen each time the CLI state changes.
    cli$.subscribe(e => this.forceUpdate());

    cli$.pipe(filter(e => e.invoked && !e.namespace)).subscribe(async e => {
      const command = e.props.command as ICommand<t.ICommandProps>;
      const db = this.state.selectedDb;
      const props: t.ICommandProps = { db, events$: this.cli.events$ };
      const args = e.props.args;

      // Step into namespace (if required).
      if (!command.handler && command.children.length > 0) {
        this.cli.state.change({ text: this.cli.state.text, namespace: true });
      }

      // Invoke handler.
      if (command.handler) {
        console.log('INVOKE', command.toString());
        const res = await command.invoke({ props, args });
        console.log('Shell // invoke response // props', res.props);
      }
    });

    /**
     * Handle callbacks from within invoking commands.
     */
    commandEvents$.pipe(filter(e => e.type === 'CLI/db/new')).subscribe(e => {
      this.handleNew();
    });
    commandEvents$
      .pipe(
        filter(e => e.type === 'CLI/db/join'),
        map(e => e as t.IJoinDbEvent),
      )
      .subscribe(e => {
        const { dbKey } = e.payload;
        if (dbKey) {
          this.handleJoinComplete({ dbKey });
        } else {
          this.handleJoinStart();
        }
      });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */

  private get store() {
    return this.context.store;
  }

  private get cli() {
    return this.context.cli;
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
    const { ipc, log, db } = this.context;
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
      await db.getOrCreate({ dir, dbKey });

      // await renderer.getOrCreate({ ipc, dir, dbKey });
      this.state$.next({ selected: name });
    } catch (error) {
      log.error(error);
    }
  }

  private focusCommandPrompt = () => {
    if (this.commandPrompt) {
      this.commandPrompt.focus();
    }
  };

  /**
   * [Render]
   */

  public render() {
    const styles = {
      base: css({ Absolute: 0 }),
      body: css({
        Absolute: 0,
        Flex: 'horizontal',
      }),
      index: css({
        position: 'relative',
        width: 180,
        minWidth: 140,
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
    const { selectedDb, selectedNetwork } = this.state;
    const cli = this.cli.state;
    const styles = {
      base: css({
        flex: 1,
        Flex: 'vertical',
      }),
      body: css({
        flex: 1,
        display: 'flex',
        position: 'relative',
        // Scroll: true,
      }),
      footer: css({
        position: 'relative',
        backgroundColor: COLORS.DARK,
      }),
    };

    const elBody = selectedDb && (
      <ShellMain
        key={selectedDb.key}
        db={selectedDb}
        network={selectedNetwork}
        onFocusCommandPrompt={this.focusCommandPrompt}
      />
    );

    return (
      <div {...styles.base}>
        <div {...styles.body}>{elBody}</div>
        <div {...styles.footer}>
          <CommandPrompt
            ref={this.commandPromptRef}
            text={cli.text}
            namespace={cli.namespace}
            onChange={cli.change}
            onAutoComplete={this.onAutoComplete}
          />
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

  private onAutoComplete = () => {
    const cli = this.cli.state;
    if (cli.command) {
      return;
    }
    const root = cli.namespace ? cli.namespace.command : cli.root;
    const match = root.children.find(c => str.fuzzy.isMatch(cli.text, c.name));
    if (match) {
      cli.change({ text: match.name });
    }
  };
}
