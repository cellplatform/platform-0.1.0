import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, GlamorValue, ICommand, ICommandState, str } from '../../common';
import { ObjectView } from '../primitives';

export type CommandClickEvent = {
  cmd: ICommand;
};
export type CommandClickEventHandler = (e: CommandClickEvent) => void;

export type IHelpProps = {
  cli: ICommandState;
  debug?: any;
  style?: GlamorValue;
  onCommandClick?: CommandClickEventHandler;
};
export type IHelpState = {};

export class Help extends React.PureComponent<IHelpProps, IHelpState> {
  public state: IHelpState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<IHelpState>();

  /**
   * [Lifecycle]
   */
  constructor(props: IHelpProps) {
    super(props);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    const change$ = this.cli.change$.pipe(takeUntil(this.unmounted$));
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

    const elDebug = debug && (
      <div {...styles.debug}>
        <ObjectView data={debug} expandLevel={2} />
      </div>
    );

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.title}>Help</div>
        <div {...styles.body}>
          <div {...styles.list}>{elList}</div>
          {elDebug}
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private commandClickHandler = (cmd: ICommand) => {
    return () => {
      const { onCommandClick } = this.props;
      if (onCommandClick) {
        onCommandClick({ cmd });
      }
    };
  };
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
