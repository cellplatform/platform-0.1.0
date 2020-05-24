import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { color, ui, css, CssValue, t } from '../../common';

import { TreeView } from '@platform/ui.tree';
import { Icons } from '../Icons';

export type ITree = {
  root?: t.ITreeNode;
  current?: string;
  theme?: t.TreeTheme;
};

export type ITreeShellProps = {
  tree?: ITree;
  style?: CssValue;
};

export type ITreeShellState = {};

export class TreeShell extends React.PureComponent<ITreeShellProps, ITreeShellState> {
  public state: ITreeShellState = {};
  private state$ = new Subject<Partial<ITreeShellState>>();
  private unmounted$ = new Subject<{}>();
  private events$ = new Subject<t.TreeViewEvent>();

  public static contextType = ui.Context;
  public context!: ui.IEnvContext;

  /**
   * [Lifecycle]
   */
  constructor(props: ITreeShellProps) {
    super(props);
  }

  public componentDidMount() {
    // Setup initial conditions.
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    const tree = TreeView.events(this.events$.pipe(takeUntil(this.unmounted$)));

    // Mouse.
    const left = tree.mouse({ button: 'LEFT' });
    left.click.all$.subscribe((e) => {
      console.log('LEFT/CLICK', e);
    });
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
      }),
      left: css({
        position: 'relative',
        display: 'flex',
        width: 240,
        borderRight: `solid 1px ${color.format(-0.15)}`,
      }),
      right: css({
        flex: 1,
        padding: 30,
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
            events$={this.events$}
            tabIndex={0}
          />
        </div>
        <div {...styles.right}>TreeShell</div>
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
