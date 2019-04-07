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

/**
 * Test Component
 */
export type ITestState = {
  theme?: t.TreeTheme;
  root?: t.ITreeNode;
  current?: string;
};
export class Test extends React.PureComponent<{}, ITestState> {
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
        Absolute: 20,
        Flex: 'horizontal',
      }),
      left: css({
        width: 180,
        Flex: 'vertical-spaceBetween',
        lineHeight: 1.6,
      }),

      right: css({
        flex: 1,
        borderLeft: `solid 1px ${color.format(-0.1)}`,
        backgroundColor: theme === 'DARK' && COLORS.DARK,
        paddingLeft: 20,
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
          <TreeView
            node={this.state.root}
            current={this.state.current}
            theme={this.state.theme}
            background={'NONE'}
            renderIcon={this.renderIcon}
          />
        </div>
      </div>
    );
  }

  private button = (label: string, handler: () => void) => {
    return <Button label={label} onClick={handler} />;
  };

  /**
   * [Handlers]
   */
  private renderIcon: t.RenderTreeIcon = e => {
    return Icons[e.icon];
  };
}
