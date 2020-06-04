import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CssValue, onStateChanged, t, ui } from '../../common';
import { Icons } from '../Icons';
import { TreeView } from '../primitives';

export type ITreeShellTreeProps = { style?: CssValue };

export class TreeShellTree extends React.PureComponent<ITreeShellTreeProps> {
  private unmounted$ = new Subject<{}>();
  private tree$ = new Subject<t.TreeViewEvent>();

  public static contextType = ui.Context;
  public context!: t.IFinderContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    const ctx = this.context;
    const changes = onStateChanged(ctx.event$, this.unmounted$);
    this.tree$.pipe(takeUntil(this.unmounted$)).subscribe((e) => ctx.fire(e));

    // Redraw when tree-state changes.
    changes.on('FINDER/tree').subscribe(() => this.forceUpdate());
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get tree(): t.IFinderState['tree'] {
    const { root, current, theme = 'LIGHT' } = this.context.getState().tree || {};
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
