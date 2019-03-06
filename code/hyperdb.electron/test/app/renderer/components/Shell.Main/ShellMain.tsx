import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, t, GlamorValue, CommandState, renderer } from '../../common';
import { ObjectView } from '../primitives';
import { DbHeader } from './components/DbHeader';
import { Help, CommandClickEvent } from '../cli.Help';

export type IShellMainProps = {
  cli: CommandState;
  db: t.ITestRendererDb;
  style?: GlamorValue;
  onFocusCommandPrompt?: (e: {}) => void;
};
export type IShellMainState = {
  view?: 'WATCH';
};

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
    const unmounted$ = this.unmounted$;
    this.state$.pipe(takeUntil(unmounted$)).subscribe(e => this.setState(e));
    this.cli.change$.pipe(takeUntil(unmounted$)).subscribe(e => this.forceUpdate());
    this.cli.invoke$.pipe(takeUntil(unmounted$)).subscribe(e => {
      console.log('INVOKE', e);
      console.log(`\nTODO 🐷   \n`);
    });
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
   * [Methods]
   */
  public invoke() {
    const command = this.cli.command;
    if (command && command.title === 'watch') {
      this.state$.next({ view: 'WATCH' });
    }
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
