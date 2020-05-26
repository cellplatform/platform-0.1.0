import { TreeView } from '@platform/ui.tree';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue, t, ui } from '../../common';
import { Icons } from '../Icons';

export type ITree = {
  root?: t.ITreeNode;
  current?: string;
  theme?: t.TreeTheme;
};

export type ITreeShellProps = {
  tree?: ITree;
  // tree$?: Subject<t.TreeViewEvent>;
  body?: React.ReactNode;
  style?: CssValue;
};

export type ITreeShellState = {
  view?: React.ReactNode;
};

export class TreeShell extends React.PureComponent<ITreeShellProps, ITreeShellState> {
  public static events = TreeView.events;
  public state: ITreeShellState = {};
  private state$ = new Subject<Partial<ITreeShellState>>();
  private unmounted$ = new Subject<{}>();
  private tree$ = new Subject<t.TreeViewEvent>();

  public static contextType = ui.Context;
  public context!: ui.IEnvContext<t.FinderEvent>;

  /**
   * [Lifecycle]
   */
  constructor(props: ITreeShellProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    this.tree$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.context.dispatch(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */

  public get tree(): ITree {
    const { root, current, theme = 'LIGHT' } = this.props.tree || {};
    return { root, current, theme };
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        position: 'relative',
        Flex: 'horizontal-stretch-stretch',
        boxSizing: 'border-box',
      }),
      left: css({
        position: 'relative',
        display: 'flex',
        width: 240,
        borderRight: `solid 1px ${color.format(-0.15)}`,
      }),
      right: css({
        position: 'relative',
        flex: 1,
        display: 'flex',
      }),
    };

    const tree = this.tree;

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.left}>
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
        </div>
        <div {...styles.right}>{this.props.body}</div>
      </div>
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
