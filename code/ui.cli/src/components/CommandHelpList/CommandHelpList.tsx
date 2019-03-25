import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, GlamorValue, str, t } from '../../common';

export type ICommandHelpListProps = {
  cli: t.ICommandState;
  style?: GlamorValue;
  onCommandClick?: t.CommandClickEventHandler;
};
export type ICommandHelpListState = {};

export class CommandHelpList extends React.PureComponent<
  ICommandHelpListProps,
  ICommandHelpListState
> {
  public state: ICommandHelpListState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<ICommandHelpListState>();

  /**
   * [Lifecycle]
   */
  constructor(props: ICommandHelpListProps) {
    super(props);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    const changed$ = this.cli.changed$.pipe(takeUntil(this.unmounted$));
    changed$.subscribe(e => this.forceUpdate());
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
    const styles = {
      base: css({
        fontSize: 14,
        color: color.format(-0.5),
        boxSizing: 'border-box',
        flex: 1,
        position: 'relative',
        Flex: 'vertical',
      }),
      list: css({
        marginLeft: 5,
        lineHeight: 1.5,
      }),
      cmd: css({
        opacity: 0.3,
        cursor: 'pointer',
      }),
      cmdMatch: css({
        opacity: 1,
      }),
      debug: css({
        maxHeight: '50%',
        Scroll: true,
        paddingBottom: 10,
      }),
    };

    const elList = this.commandList.map((item, i) => {
      const { isMatch, cmd } = item;
      let name = item.name;
      name = cmd.children.length > 0 ? `${name} (${cmd.children.length})` : name;
      return (
        <div
          key={i}
          {...css(styles.cmd, isMatch && styles.cmdMatch)}
          onClick={this.commandClickHandler(cmd)}
        >
          {name}
        </div>
      );
    });

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.list}>{elList}</div>
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private commandClickHandler = (cmd: t.ICommand) => {
    return () => {
      const { onCommandClick } = this.props;
      if (onCommandClick) {
        onCommandClick({ cmd });
      }
    };
  };
}

/**
 * [Helpers]
 */

function matchCommands(input: string, parent: t.ICommand) {
  return parent.children.map(cmd => {
    const { id, name } = cmd;
    const isMatch = str.fuzzy.isMatch(input, name);
    return { cmd, id, name, isMatch };
  });
}
