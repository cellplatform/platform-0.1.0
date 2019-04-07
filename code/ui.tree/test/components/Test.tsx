import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TreeView } from '../../src';
import { Button, color, COLORS, css, ObjectView, t } from './common';
import { Icons } from './Icons';

const TREE: t.ITreeNode = {
  id: 'root',
  props: {
    label: 'Sheet',
    icon: 'Face',
    header: { isVisible: false },
  },
  children: [
    { id: 'child-1', props: { icon: 'Face', marginTop: 30 } },
    { id: 'child-2', props: { icon: 'Face' } },
    { id: 'child-3', props: { icon: 'Face' } },
    { id: 'child-4', props: { icon: 'Face' } },
    { id: 'child-5', props: { icon: 'Face' } },
  ],
};

export type ITestState = {
  theme?: t.TreeTheme;
  root?: t.ITreeNode;
  current?: string;
};
export class Test extends React.PureComponent<{}, ITestState> {
  /**
   * [Fields]
   */
  public state: ITestState = { root: TREE, theme: 'LIGHT' };
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestState>>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */

  public render() {
    const { theme } = this.state;
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'horizontal',
      }),
      left: css({
        width: 200,
        Flex: 'vertical-spaceBetween',
        lineHeight: 1.8,
        fontSize: 12,
        padding: 10,
        borderRight: `solid 1px ${color.format(-0.1)}`,
        backgroundColor: color.format(-0.02),
      }),

      right: css({
        backgroundColor: theme === 'DARK' ? COLORS.DARK : undefined,

        position: 'relative',
        Flex: 'horizontal-start-center',
        flex: 1,
      }),
      rightCenter: css({
        height: '100%',
        width: 300,
        display: 'flex',
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.left}>
          <div>
            {this.button('theme: LIGHT', () => this.state$.next({ theme: 'LIGHT' }))}
            {this.button('theme: DARK', () => this.state$.next({ theme: 'DARK' }))}
          </div>
          <ObjectView name={'tree'} data={this.state.root} />
        </div>
        <div {...styles.right}>
          <div {...styles.rightCenter}>{this.renderTree()}</div>
        </div>
      </div>
    );
  }

  private renderTree() {
    const { theme } = this.state;
    const borderColor = theme === 'DARK' ? color.format(0.2) : color.format(-0.1);
    const border = `solid 1px ${borderColor}`;
    const styles = {
      base: css({
        flex: 1,
        display: 'flex',
        borderLeft: border,
        borderRight: border,
      }),
    };
    return (
      <div {...styles.base}>
        <TreeView
          node={this.state.root}
          current={this.state.current}
          theme={this.state.theme}
          background={'NONE'}
          renderIcon={this.renderIcon}
        />
      </div>
    );
  }

  private button = (label: string, handler: () => void) => {
    return <Button label={label} onClick={handler} block={true} />;
  };

  /**
   * [Handlers]
   */
  private renderIcon: t.RenderTreeIcon = e => Icons[e.icon];
}
