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
import * as React from 'react';
import { css, color, GlamorValue, t } from '../../common';
import { TreeView, ITreeViewProps } from '../primitives';
import { TreeIcons } from './TreeIcons';
import * as util from './util';

export type ICommandTreeProps = {
  root: t.ICommand;
  theme: ITreeViewProps['theme'];
  background: ITreeViewProps['background'];
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

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    // Setup observables
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    const mouse$ = this.mouse$.pipe(
      takeUntil(this.unmounted$),
      filter(e => e.button === 'LEFT'),
    );
    const click$ = mouse$.pipe(filter(e => e.type === 'DOWN'));

    // Update state.
    state$.subscribe(e => this.setState(e));

    // TEMP 🐷
    const tree = util.buildTree(this.props.root);
    this.state$.next({ tree });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    return (
      <TreeView
        node={this.state.tree}
        // current={this.state.current}
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
