import { TreeView } from '@platform/ui.tree';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CssValue, onStateChanged, t, ui } from '../../common';
import { Icons } from '../Icons';

export type ITreeProps = { style?: CssValue };

export class Tree extends React.PureComponent<ITreeProps> {
  private unmounted$ = new Subject<{}>();
  private tree$ = new Subject<t.TreeViewEvent>();

  public static contextType = ui.Context;
  public context!: t.IFinderContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.tree$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.context.dispatch(e));
    onStateChanged(this.context, 'FINDER/tree', () => this.forceUpdate());
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get tree(): t.IFinderState['tree'] {
    const { root, current, theme = 'LIGHT' } = this.context.toState().tree || {};
    return { root, current, theme };
  }

  /**
   * [Render]
   */
  public render() {
    const tree = this.tree;
    return (
      <TreeView
        node={tree.root}
        current={tree.current}
        theme={tree.theme}
        background={'NONE'}
        renderIcon={this.renderIcon}
        renderPanel={this.renderPanel}
        renderNodeBody={this.renderNodeBody}
        events$={this.tree$}
        tabIndex={0}
      />
    );
  }

  private renderIcon: t.RenderTreeIcon = (e) => Icons[e.icon];

  private renderNodeBody: t.RenderTreeNodeBody = (e) => {
    return undefined;
  };

  private renderPanel: t.RenderTreePanel<t.ITreeNode> = (e) => {
    return undefined;
  };
}
