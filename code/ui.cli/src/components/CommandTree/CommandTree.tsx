import * as React from 'react';
import { Subject } from 'rxjs';
import { share, filter, takeUntil } from 'rxjs/operators';

import { GlamorValue, t } from '../../common';
import { ITreeViewProps, TreeView } from '../primitives';
import { TreeIcons } from './TreeIcons';
import * as util from './util';

export type ICommandTreeProps = {
  root: t.ICommand;
  current?: t.ICommand;
  theme: ITreeViewProps['theme'];
  background: ITreeViewProps['background'];
  events?: Subject<t.CommandTreeEvent>;
  style?: GlamorValue;
};
export type ICommandTreeState = {
  tree?: t.ITreeNode;
  // current?: string;
};

export class CommandTree extends React.PureComponent<ICommandTreeProps, ICommandTreeState> {
  public state: ICommandTreeState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ICommandTreeState>>();
  private mouse$ = new Subject<t.TreeNodeMouseEvent>();
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
    const mouse$ = this.mouse$.pipe(
      takeUntil(this.unmounted$),
      filter(e => e.button === 'LEFT'),
    );
    const click$ = mouse$.pipe(filter(e => e.type === 'DOWN'));

    // Update state.
    state$.subscribe(e => this.setState(e));

    // Bubble events.
    if (this.props.events) {
      this.events$.subscribe(this.props.events);
    }

    mouse$
      // Drill into child node.
      .pipe(
        filter(
          e =>
            (e.type === 'DOUBLE_CLICK' && e.target === 'NODE') ||
            (e.type === 'DOWN' && e.target === 'DRILL_IN'),
        ),
        filter(e => (e.node.children || []).length > 0),
      )
      .subscribe(e => this.fireCurrent(e.node));

    click$
      // Step up to parent.
      .pipe(filter(e => e.target === 'PARENT'))
      .subscribe(e => {
        const parent = TreeView.util.parent(this.state.tree, e.node);
        this.fireCurrent(parent);
      });

    // TEMP 🐷
    const tree = util.buildTree(this.root);
    this.state$.next({ tree });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * Propertes
   */
  public get root() {
    return this.props.root;
  }

  /**
   * [Methods]
   */
  private fireCurrent(node?: string | t.ITreeNode) {
    const id = util.asCommandId(node);
    const command = this.root.tree.find(cmd => cmd.id === id);
    this.fire({ type: 'COMMAND_TREE/current', payload: { command } });
  }

  private fire(e: t.CommandTreeEvent) {
    this._events$.next(e);
  }

  /**
   * [Render]
   */
  public render() {
    return (
      <TreeView
        node={this.state.tree}
        current={util.asNodeId(this.props.current)}
        theme={'DARK'}
        background={'NONE'}
        renderIcon={this.renderIcon}
        mouseEvents$={this.mouse$}
        style={this.props.style}
      />
    );
  }

  /**
   * [Handlers]
   */
  private renderIcon: t.RenderTreeIcon = e => {
    return TreeIcons[e.icon];
  };
}
