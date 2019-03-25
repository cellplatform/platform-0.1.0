import { Button, ObjectView } from '@uiharness/ui';
import * as React from 'react';

import { TreeView } from '../../src/components/primitives';
import { color, css, t, COLORS } from '../../src/common';
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
export type ITestTreeState = {
  tree?: t.ITreeNode;
};
export class TestTree extends React.PureComponent<{}, ITestTreeState> {
  public state: ITestTreeState = { tree: TREE };

  public render() {
    const styles = {
      base: css({
        flex: 1,
        Flex: 'horizontal',
        backgroundColor: COLORS.DARK,
      }),
    };
    return (
      <div {...styles.base}>
        <TreeView
          node={this.state.tree}
          theme={'DARK'}
          background={'NONE'}
          renderIcon={this.renderIcon}
        />
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private renderIcon: t.RenderTreeIcon = e => {
    return Icons[e.icon];
  };
}
