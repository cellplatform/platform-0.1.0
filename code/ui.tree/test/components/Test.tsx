import '../../node_modules/@platform/css/reset.css';
import '@babel/polyfill';

import { Button, ObjectView } from '@uiharness/ui';
import * as React from 'react';

import { TreeView } from '../../src';
import { color, css, t } from '../../src/common';
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
export type IState = { tree?: t.ITreeNode };
export class Test extends React.PureComponent<{}, IState> {
  public state: IState = { tree: TREE };

  public render() {
    const styles = {
      base: css({
        Absolute: 20,
        Flex: 'horizontal',
      }),
      left: css({
        width: 180,
        Flex: 'vertical-spaceBetween',
      }),

      right: css({
        flex: 1,
        borderLeft: `solid 1px ${color.format(-0.1)}`,
        paddingLeft: 20,
        display: 'flex',
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.left}>
          <div>
            <Button label={'Foo'} />
          </div>
          <ObjectView name={'tree'} data={this.state.tree} />
        </div>
        <div {...styles.right}>
          <TreeView
            node={this.state.tree}
            theme={'LIGHT'}
            background={'NONE'}
            renderIcon={this.renderIcon}
          />
        </div>
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
