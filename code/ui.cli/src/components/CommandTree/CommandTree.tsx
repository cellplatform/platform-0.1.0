import * as React from 'react';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
} from 'rxjs/operators';
import { GlamorValue, t } from '../../common';
import { CommandTreeView, ICommandTreeViewProps } from './CommandTreeView';

export type ICommandTreeProps = {
  cli: t.ICommandState;
  theme?: ICommandTreeViewProps['theme'];
  background?: ICommandTreeViewProps['background'];
  events$?: Subject<t.CommandTreeEvent>;
  style?: GlamorValue;
};
export type ICommandTreeState = {};

export class CommandTree extends React.PureComponent<ICommandTreeProps, ICommandTreeState> {
  public state: ICommandTreeState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ICommandTreeState>>();

  private _events$ = new Subject<t.CommandTreeEvent>();
  public events$ = this._events$.pipe(
    takeUntil(this.unmounted$),
    share(),
  );

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    // Setup observables.
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    const changed$ = this.cli.changed$.pipe(takeUntil(this.unmounted$));
    const tree$ = this.events$;

    // Update state.
    state$.subscribe(e => this.setState(e));

    // Bubble events.
    if (this.props.events$) {
      this.events$.subscribe(this.props.events$);
    }

    // Redraw on CLI changed.
    changed$.subscribe(e => this.forceUpdate());

    tree$
      // Invoke command on click.
      .pipe(
        filter(e => e.type === 'COMMAND_TREE/click'),
        map(e => e.payload as t.ICommandTreeClick),
      )
      .subscribe(e => {
        console.log('invoke', e);
        // this.cli.invoke()
        const command = e.command;

        const path = this.cli.root.tree.toPath(command);
        console.log('path', path);

        // this.cli.change({ text: command.name });
      });

    tree$
      // Invoke command on click.
      .pipe(
        filter(e => e.type === 'COMMAND_TREE/current'),
        map(e => e.payload as t.ICommandTreeCurrent),
      )
      .subscribe(e => {
        console.group('🌳 CURRENT');

        console.log('e.direction', e.direction);

        const command = e.command;
        const namespace = e.direction === 'PARENT' ? 'PARENT' : true;
        const text = command ? command.name : '';

        this.cli.change({ text, namespace });

        console.groupEnd();
      });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get cli() {
    return this.props.cli;
  }

  public get nsCommand() {
    return this.cli.namespace ? this.cli.namespace.command : undefined;
  }

  /**
   * [Render]
   */
  public render() {
    return (
      <CommandTreeView
        rootCommand={this.cli.root}
        nsCommand={this.nsCommand}
        currentCommand={this.cli.command}
        fuzzyMatches={this.cli.fuzzyMatches}
        theme={this.props.theme}
        background={this.props.background}
        events$={this._events$}
        style={this.props.style}
      />
    );
  }
}
