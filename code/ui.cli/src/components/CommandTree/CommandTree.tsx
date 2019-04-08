import * as React from 'react';
import { Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';

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

    // Update state.
    state$.subscribe(e => this.setState(e));

    // Bubble events.
    if (this.props.events$) {
      this.events$.subscribe(this.props.events$);
    }

    // Redraw on CLI changed.
    changed$.subscribe(e => this.forceUpdate());
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

  public get current() {
    return this.cli.namespace ? this.cli.namespace.command : undefined;
  }

  /**
   * [Render]
   */
  public render() {
    return (
      <CommandTreeView
        root={this.cli.root}
        current={this.current}
        fuzzyMatches={this.cli.fuzzyMatches}
        theme={this.props.theme}
        background={this.props.background}
        events$={this._events$}
        style={this.props.style}
      />
    );
  }
}
