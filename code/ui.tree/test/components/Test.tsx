import '../../node_modules/@platform/css/reset.css';
import '@babel/polyfill';

import { Button, ObjectView } from '@uiharness/ui';
import * as React from 'react';

import { TreeView } from '../../src';
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
export type IState = {
  tree?: t.ITreeNode;
  theme?: t.TreeTheme;
};
export class Test extends React.PureComponent<{}, IState> {
  public state: IState = { tree: TREE, theme: 'LIGHT' };

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
            {this.button('theme: LIGHT', () => this.setState({ theme: 'LIGHT' }))}
            {this.button('theme: DARK', () => this.setState({ theme: 'DARK' }))}
          </div>
          <ObjectView name={'tree'} data={this.state.tree} />
        </div>
        <div {...styles.right}>
          <TreeView
            node={this.state.tree}
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
