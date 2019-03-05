import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, t, GlamorValue, CommandState, renderer } from '../../common';
import { ObjectView } from '../primitives';
import { DbHeader } from '../Db.Header';
import { Help, CommandClickEvent } from './components/Help';

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
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    const cli = {
      change$: this.props.cli.change$.pipe(takeUntil(this.unmounted$)),
      invoke$: this.props.cli.invoke$.pipe(takeUntil(this.unmounted$)),
    };

    cli.change$.subscribe(e => this.forceUpdate());
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
            <Help cli={cli} onCommandClick={this.handleCommandClick} />
          </div>
        </div>
      </div>
    );
  }

  private renderOutput() {
    const { cli } = this.props;
    const styles = {
      base: css({
        flex: 1,
      }),
    };
    return (
      <div {...styles.base}>
        <ObjectView data={cli.toObject()} />
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private handleCommandClick = (e: CommandClickEvent) => {
    this.cli.change({ text: e.cmd.title });
    const { onFocusCommandPrompt } = this.props;
    if (onFocusCommandPrompt) {
      onFocusCommandPrompt({});
    }
  };
}
