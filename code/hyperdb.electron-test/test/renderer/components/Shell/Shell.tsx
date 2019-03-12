import * as React from 'react';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';

import { CommandClickEvent, Help } from '../cli.Help';

import { color, COLORS, css, GlamorValue, ICommand, renderer, str, t } from '../../common';
import { CommandPrompt } from '../cli.CommandPrompt';
import { JoinDialog } from '../Dialog.Join';
import { ErrorDialog } from '../Dialog.Error';
import { JoinWithKeyEvent } from '../Dialog.Join/types';
import { ShellIndex, ShellIndexSelectEvent } from '../Shell.Index';
import { ShellMain } from '../Shell.Main';

const AUTO_CONNECT = false;

export type IShellProps = {
  style?: GlamorValue;
};

export type IShellState = {
  dialog?: 'JOIN' | 'ERROR';
  selectedDir?: string; // database [dir].
  error?: {
    message: string;
    command: ICommand;
  };
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
        distinctUntilChanged(prev => prev.selectedDir === this.selectedDir),
      )
      .subscribe(e => this.updateState());

    const db = this.context.db;
    const dbChange$ = db.events$.pipe(
      takeUntil(this.unmounted$),
      filter(e => e.type === 'DB_FACTORY/change'),
      debounceTime(0),
    );
    dbChange$.subscribe(e => this.updateState());

    // Redraw screen each time the CLI state changes.
    cli$.pipe(debounceTime(0)).subscribe(e => this.forceUpdate());

    cli$.pipe(filter(e => e.invoked && !e.namespace)).subscribe(async e => {
      const { args } = e.props;
      const command = e.props.command as t.ICommand<t.ITestCommandProps>;
      const selection = this.selection;
      const db = selection ? selection.db : undefined;
      this.cli.invoke({ command, args, db });
    });

    /**
     * Handle callbacks from within invoking commands.
     */
    commandEvents$
      .pipe(
        filter(e => e.type === 'CLI/db/select'),
        map(e => e as t.ICliSelectDbEvent),
        map(e => e.payload.dir),
      )
      .subscribe(selectedDir => this.state$.next({ selectedDir }));

    commandEvents$
      .pipe(
        filter(e => e.type === 'CLI/error'),
        map(e => e as t.ICliErrorEvent),
        // map(e => e.payload.),
      )
      .subscribe(e => {
        const { message, command } = e.payload;
        // console.log('error', message);
        console.log('-------------------------------------------');
        this.state$.next({ dialog: 'ERROR', error: { message, command } });
      });

    commandEvents$
      .pipe(
        filter(e => e.type === 'CLI/db/join'),
        map(e => e as t.IJoinDbEvent__DELETE),
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

  private get databases() {
    return this.context.db.items.map(m => m.db);
  }

  private get selectedDir() {
    let { selectedDir } = this.state;
    const databases = this.databases;
    selectedDir = selectedDir ? selectedDir : databases.length > 0 ? databases[0].dir : undefined;
    return selectedDir;
  }

  public get selection() {
    const db = this.context.db;
    const selectedDir = this.selectedDir;
    return selectedDir ? db.items.find(item => item.db.dir === selectedDir) : undefined;
  }

  /**
   * [Methods]
   */

  public async updateState() {
    const selectedDir = this.selectedDir;
    this.state$.next({ selectedDir });
  }

  private async createDatabase(args: { dbKey?: string }) {
    const { log, db } = this.context;
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
      await db.getOrCreate({ dir, dbKey, connect: AUTO_CONNECT });
      this.state$.next({ selectedDir: name });
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
      left: css({
        position: 'relative',
        width: 180,
        minWidth: 140,
      }),
      middle: css({
        position: 'relative',
        flex: 1,
        display: 'flex',
      }),
      right: css({
        width: 190,
        borderLeft: `solid 1px ${color.format(-0.1)}`,
        paddingLeft: 6,
        paddingTop: 8,
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.body}>
          <ShellIndex
            style={styles.left}
            selected={this.selectedDir}
            onNew={this.handleNew}
            onConnect={this.handleJoinStart}
            onSelect={this.handleSelect}
          />
          <div {...styles.middle}>{this.renderMain()}</div>
          <div {...styles.right}>
            <Help cli={this.cli.state} onCommandClick={this.handleHelpCommandClick} />
          </div>
        </div>
        {this.renderDialog()}
      </div>
    );
  }

  private renderMain() {
    const selection = this.selection;
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
      }),
      footer: css({
        position: 'relative',
        backgroundColor: COLORS.DARK,
      }),
    };

    const elBody = (
      <ShellMain
        key={selection && selection.db.key}
        db={selection && selection.db}
        network={selection && selection.network}
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

      case 'ERROR':
        const error = this.state.error;
        return (
          error && (
            <ErrorDialog error={error.message} command={error.command} onClose={this.clearDialog} />
          )
        );
    }
    return null;
  }

  /**
   * [Handlers]
   */

  private handleNew = async () => {
    // NB: Handled by command now.
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
    this.state$.next({ selectedDir: e.dir });
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

  private handleHelpCommandClick = (e: CommandClickEvent) => {
    this.cli.state.change({ text: e.cmd.name });
    this.focusCommandPrompt();
  };
}
