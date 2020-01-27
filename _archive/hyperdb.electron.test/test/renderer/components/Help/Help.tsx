import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue, ICommand, ICommandState, str } from '../../common';
import { ObjectView, CommandHelpList, CommandClickEventHandler } from '../primitives';

// export type CommandClickEvent = {
//   cmd: ICommand;
// };
// export type CommandClickEventHandler = (e: CommandClickEvent) => void;

export type IHelpProps = {
  cli: ICommandState;
  debug?: any;
  style?: CssValue;
  onCommandClick?: CommandClickEventHandler;
};
export type IHelpState = {};

export class Help extends React.PureComponent<IHelpProps, IHelpState> {
  public state: IHelpState = {};
  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<IHelpState>();

  /**
   * [Lifecycle]
   */
  constructor(props: IHelpProps) {
    super(props);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    const change$ = this.cli.changed$.pipe(takeUntil(this.unmounted$));
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

  public get root() {
    return this.cli.root;
  }

  private get commandList() {
    const { cli } = this.props;
    const currentId = cli.command ? cli.command.id : undefined;
    const root = cli.namespace ? cli.namespace.command : cli.root;
    const list = matchCommands(cli.text, root).map(item => {
      const isCurrent = item.id === currentId;
      return isCurrent ? { ...item, isMatch: true } : item;
    });
    return list;
  }

  /**
   * [Render]
   */

  public render() {
    const { debug } = this.props;
    const styles = {
      base: css({
        fontSize: 14,
        color: color.format(-0.5),
        boxSizing: 'border-box',
        flex: 1,
        position: 'relative',
        Flex: 'vertical',
      }),
      title: css({
        fontWeight: 'bold',
        marginBottom: 5,
        paddingBottom: 5,
        borderBottom: `solid 4px ${color.format(-0.05)}`,
        paddingLeft: 5,
        textTransform: 'uppercase',
        fontSize: 12,
      }),
      body: css({
        Flex: 'vertical-spaceBetween',
        flex: 1,
      }),
      debug: css({
        maxHeight: '50%',
        Scroll: true,
        paddingBottom: 10,
      }),
    };

    const elDebug = debug && (
      <div {...styles.debug}>
        <ObjectView data={debug} expandLevel={2} />
      </div>
    );

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.title}>Help</div>
        <div {...styles.body}>
          <CommandHelpList cli={this.cli} onCommandClick={this.props.onCommandClick} />
          {elDebug}
        </div>
      </div>
    );
  }
}

/**
 * [INTERNAL]
 */

function matchCommands(input: string, parent: ICommand) {
  return parent.children.map(cmd => {
    const { id, name } = cmd;
    const isMatch = str.fuzzy.isMatch(input, name);
    return { cmd, id, name, isMatch };
  });
}
