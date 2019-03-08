import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, CommandState, css, GlamorValue, renderer, t } from '../../common';
import { CommandClickEvent, Help } from '../cli.Help';
import { DbHeader } from './components/DbHeader';
import { DbStatus } from './components/DbStatus';
import { DbWatch } from './components/DbWatch';

export type IShellMainProps = {
  cli: CommandState;
  db: t.ITestRendererDb;
  style?: GlamorValue;
  onFocusCommandPrompt?: (e: {}) => void;
};
export type IShellMainState = {};

export class ShellMain extends React.PureComponent<IShellMainProps, IShellMainState> {
  public state: IShellMainState = {};
  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;
  private unmounted$ = new Subject();
  private state$ = new Subject<IShellMainState>();

  /**
   * [Lifecycle]
   */

  constructor(props: IShellMainProps) {
    super(props);
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    const change$ = this.cli.change$.pipe(takeUntil(this.unmounted$));

    state$.subscribe(e => this.setState(e));
    change$.subscribe(e => this.forceUpdate());
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  public get cli() {
    return this.props.cli;
  }

  public get store() {
    return this.context.store as t.ITestStore;
  }

  /**
   * [Render]
   */

  public render() {
    const { db, cli } = this.props;
    const styles = {
      base: css({
        flex: 1,
        Flex: 'vertical-stretch-stretch',
        padding: 20,
      }),
      header: css({ marginBottom: 20 }),
      body: css({
        flex: 1,
        Flex: 'horizontal-stretch-stretch',
      }),
      help: css({
        width: 190,
        borderLeft: `solid 1px ${color.format(-0.1)}`,
        paddingLeft: 6,
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <DbHeader db={db} style={styles.header} />
        <div {...styles.body}>
          {this.renderOutput()}
          <div {...styles.help}>
            <Help cli={cli} onCommandClick={this.handleHelpCommandClick} />
          </div>
        </div>
      </div>
    );
  }

  private renderOutput() {
    const { cli, db } = this.props;
    const ns = cli.namespace;
    const styles = {
      base: css({ flex: 1 }),
    };
    const elStatus = ns && ns.command.name === 'db' && (
      <DbStatus key={db.localKey} db={db} cli={cli} />
    );
    const elWatch = !elStatus && <DbWatch db={db} cli={cli} />;
    return (
      <div {...styles.base}>
        {elStatus}
        {elWatch}
      </div>
    );

    // return <div {...styles.base}>{data && <ObjectView data={data} expandLevel={3} />}</div>;
  }

  /**
   * [Handlers]
   */
  private handleHelpCommandClick = (e: CommandClickEvent) => {
    this.cli.change({ text: e.cmd.name });
    const { onFocusCommandPrompt } = this.props;
    if (onFocusCommandPrompt) {
      onFocusCommandPrompt({});
    }
  };
}
