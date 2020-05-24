import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { color, ui, css, CssValue, t } from '../../common';

import { TreeView } from '@platform/ui.tree';
import { Icons } from '../Icons';
import * as tmp from './tmp';

export type ITreeShellProps = { style?: CssValue };
export type ITreeShellState = {
  theme?: t.TreeTheme;
  root?: t.ITreeNode;
  current?: string;
};

export class TreeShell extends React.PureComponent<ITreeShellProps, ITreeShellState> {
  public state: ITreeShellState = {
    root: tmp.SIMPLE,
    theme: 'LIGHT',
  };
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
        width: 230,
        borderRight: `solid 1px ${color.format(-0.15)}`,
      }),
      right: css({
        flex: 1,
        padding: 30,
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.left}>
          <TreeView
            node={this.state.root}
            current={this.state.current}
            theme={this.state.theme}
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
