import * as React from 'react';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';

import { color, COLORS, css, GlamorValue, ICommand, renderer, t } from '../../common';
import { ErrorDialog } from '../Dialog.Error';
import { JoinDialog } from '../Dialog.Join';
import { JoinWithKeyEvent } from '../Dialog.Join/types';
import { Help } from '../Help';
import { CommandClickEvent, CommandPrompt } from '../primitives';
import { ShellIndex, ShellIndexSelectEvent } from '../Shell.Index';
import { ShellMain } from '../Shell.Main';

export type IShellProps = {
  style?: GlamorValue;
};

export type IShellState = {
  dialog?: 'JOIN' | 'ERROR';
  selectedDir?: string; // database [dir].
  error?: { message: string; command?: ICommand };
  helpDebug?: any;
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
    const cli$ = this.cli.state.changed$.pipe(takeUntil(unmounted$));
    const command$ = this.cli.events$.pipe(takeUntil(unmounted$));

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
    // cli$.pipe(debounceTime(0)).subscribe(e => this.forceUpdate());

    /**
     * Handle callbacks from within invoking commands.
     */
    command$
      .pipe(
        filter(e => e.type === 'CLI/db/select'),
        map(e => e as t.ITestSelectDbEvent),
        map(e => e.payload.dir),
      )
      .subscribe(selectedDir => {
        this.state$.next({ selectedDir });
      });

    command$
      .pipe(
        filter(e => e.type === 'CLI/error'),
        map(e => e as t.ITestErrorEvent),
      )
      .subscribe(e => {
        const { message, command } = e.payload;
        this.state$.next({ dialog: 'ERROR', error: { message, command } });
      });

    command$
      .pipe(
        filter(e => e.type === 'CLI/rightPanel'),
        map(e => e as t.ITestRightPanelEvent),
      )
      .subscribe(e => {
        this.state$.next({ helpDebug: e.payload.data });
      });

    // Finish up.
    this.focusCommandPrompt();
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
        display: 'flex',
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
            <Help
              cli={this.cli.state}
              debug={this.state.helpDebug}
              onCommandClick={this.handleHelpCommandClick}
            />
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
          <CommandPrompt ref={this.commandPromptRef} cli={cli} />
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
    // NB: Handled by command now.
  };

  private handleSelect = async (e: ShellIndexSelectEvent) => {
    const selectedDir = e.dir;
    this.state$.next({ selectedDir });
    this.store.set('selectedDatabase', selectedDir);
  };

  private clearDialog = () => {
    this.state$.next({ dialog: undefined });
    this.focusCommandPrompt();
  };

  // private onAutoComplete = () => {
  //   const cli = this.cli.state;
  //   if (cli.command) {
  //     return;
  //   }
  //   const root = cli.namespace ? cli.namespace.command : cli.root;
  //   const match = root.children.find(c => str.fuzzy.isMatch(cli.text, c.name));
  //   if (match) {
  //     cli.change({ text: match.name });
  //   }
  // };

  private handleHelpCommandClick = (e: CommandClickEvent) => {
    this.cli.state.change({ text: e.cmd.name });
    this.focusCommandPrompt();
  };
}
