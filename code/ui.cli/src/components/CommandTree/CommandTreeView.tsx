import * as React from 'react';
import { Subject } from 'rxjs';
import { share, filter, takeUntil } from 'rxjs/operators';

import { GlamorValue, t, R } from '../../common';
import { ITreeViewProps, TreeView } from '../primitives';
import { Icons } from '../Icons';
import * as util from './util';

export type ICommandTreeViewProps = {
  root: t.ICommand;
  current?: t.ICommand;
  fuzzyMatches?: t.ICommandFuzzyMatch[];
  theme?: ITreeViewProps['theme'];
  background?: ITreeViewProps['background'];
  events$?: Subject<t.CommandTreeEvent>;
  style?: GlamorValue;
};
export type ICommandTreeViewState = {
  tree?: t.ITreeNode;
  // dimmed?: t.ICommand[];
};

export class CommandTreeView extends React.PureComponent<
  ICommandTreeViewProps,
  ICommandTreeViewState
> {
  public state: ICommandTreeViewState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ICommandTreeViewState>>();
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
    if (this.props.events$) {
      this.events$.subscribe(this.props.events$);
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

    click$
      //
      .pipe(filter(e => e.target === 'NODE'))
      .subscribe(e => {
        const command = util.asCommand(this.root, e.node);
        if (command) {
          this.fire({ type: 'COMMAND_TREE/click', payload: { command } });
        }
      });

    // Finish up.
    this.updateTree();
  }

  public componentDidUpdate(prev: ICommandTreeViewProps) {
    const dimmed = {
      prev: filterDimmed(prev.fuzzyMatches),
      next: filterDimmed(this.props.fuzzyMatches),
    };
    const isDimmedChanged = !R.equals(dimmed.prev, dimmed.next);

    if (isDimmedChanged || prev.root !== this.root) {
      this.updateTree();
    }
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Propertes]
   */
  public get root() {
    return this.props.root;
  }

  private get currentNodeId() {
    const { tree } = this.state;
    const { current } = this.props;
    return !current && tree ? tree.id : util.asNodeId(current);
  }

  /**
   * [Methods]
   */
  private updateTree() {
    // Build the tree structure.
    const tree = util.buildTree(this.root);

    // Dim any nodes that are filtered out due to the current input text.
    const dimmed = filterDimmed(this.props.fuzzyMatches);
    if (dimmed.length > 0) {
      TreeView.util.walk(tree, node => {
        if (dimmed.includes(node.id)) {
          TreeView.util.props(node).opacity = 0.3;
        }
      });
    }

    // Update state.
    this.state$.next({ tree });
  }

  private fireCurrent(node?: string | t.ITreeNode) {
    const command = util.asCommand(this.root, node);
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
        current={this.currentNodeId}
        theme={this.props.theme}
        background={this.props.background}
        renderIcon={this.renderIcon}
        mouse$={this.mouse$}
        style={this.props.style}
      />
    );
  }

  /**
   * [Handlers]
   */
  private renderIcon: t.RenderTreeIcon = e => Icons[e.icon];
}

/**
 * [Helpers]
 */

function filterDimmed(matches: t.ICommandFuzzyMatch[] = []) {
  return matches
    .filter(m => m.isMatch === false)
    .map(m => m.command)
    .map(cmd => util.asNodeId(cmd));
}

// function filterDimmedIds(matches: t.ICommandFuzzyMatch[] = []) {
//   return filterDimmed(matches).map(cmd => cmd.id);
// }
