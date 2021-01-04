import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CssValue, onStateChanged, t, ui } from '../../common';
import { Icons } from '../Icons';
import { Treeview } from '../primitives';

export type IFinderShellTreeProps = { style?: CssValue };

export class FinderShellTree extends React.PureComponent<IFinderShellTreeProps> {
  private unmounted$ = new Subject<void>();
  private tree$ = new Subject<t.TreeviewEvent>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    const ctx = this.context;
    const changes = onStateChanged(ctx.bus.event$, this.unmounted$);
    this.tree$.pipe(takeUntil(this.unmounted$)).subscribe((e) => ctx.bus.fire(e));

    // Redraw.
    changes.on('APP:FINDER/tree').subscribe(() => {
      this.forceUpdate();
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get tree(): t.IAppState['tree'] {
    const { root, current, theme = 'LIGHT' } = this.context.getState().tree || {};
    return { root, current, theme };
  }

  /**
   * [Render]
   */
  public render() {
    const tree = this.tree;
    return (
      <Treeview
        root={tree.root}
        current={tree.current}
        theme={tree.theme}
        background={'NONE'}
        renderIcon={this.renderIcon}
        renderPanel={this.renderPanel}
        renderNodeBody={this.renderNodeBody}
        event$={this.tree$}
        tabIndex={0}
      />
    );
  }

  private renderIcon: t.RenderTreeIcon = (e) => Icons[e.icon];

  private renderNodeBody: t.RenderTreeNodeBody = (e) => {
    return undefined;
  };

  private renderPanel: t.RenderTreePanel<t.ITreeviewNode> = (e) => {
    return undefined;
  };
}
