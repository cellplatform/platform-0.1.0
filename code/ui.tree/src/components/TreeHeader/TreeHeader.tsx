import { color, css, CssValue } from '@platform/css';
import * as React from 'react';

import * as themes from '../../themes';
import { Icons } from '../Icons';
import { Text } from '@platform/ui.text/lib/components/Text';
import { TreeNode } from '../TreeNode';
import { t } from '../../common';

const SIZE = {
  BACK_BUTTON: 24,
};

export type ITreeHeaderProps = {
  node: t.ITreeViewNode;
  height: number;
  title?: string;
  showParentButton?: boolean;
  theme?: themes.ITreeTheme;
  background?: 'THEME' | 'NONE';
  isFocused: boolean;
  style?: CssValue;
  onMouseParent?: t.TreeNodeMouseEventHandler;
};

export class TreeHeader extends React.PureComponent<ITreeHeaderProps> {
  private get theme() {
    return themes.themeOrDefault(this.props);
  }

  public render() {
    const theme = this.theme.header;
    const { height, title = 'Untitled', showParentButton } = this.props;

    const styles = {
      base: css({
        Absolute: [0, 0, null, 0],
        height,
        boxSizing: 'border-box',
        userSelect: 'none',
      }),
      background: css({
        Absolute: 0,
        backgroundColor: color.format(theme.bg),
        borderBottom: `solid 1px ${theme.borderBottomColor}`,
        opacity: 0.95,
      }),
      body: css({
        Absolute: 0,
        Flex: 'horizontal-spaceBetween-center',
      }),
      title: css({
        fontSize: 14,
        fontWeight: 'bold',
        textShadow: Text.toShadow([1, theme.textShadow]),
        color: color.format(theme.titleColor),
      }),
      edge: css({
        Flex: 'center-center',
        width: SIZE.BACK_BUTTON,
        height: SIZE.BACK_BUTTON,
      }),
      left: css({}),
      right: css({}),
      backButton: css({
        cursor: 'pointer',
        width: SIZE.BACK_BUTTON,
        height: SIZE.BACK_BUTTON,
      }),
    };

    const elParentButton = showParentButton && (
      <div {...styles.backButton} {...this.parentMouseHandlers}>
        {Icons.ChevronLeft({ color: theme.chevronColor })}
      </div>
    );

    return (
      <div {...css(styles.base, this.props.style)}>
        <Text>
          <div {...styles.background} />
          <div {...styles.body}>
            <div {...css(styles.edge, styles.left)}>{elParentButton}</div>
            <div {...styles.title}>{title}</div>
            <div {...css(styles.edge, styles.right)} />
          </div>
        </Text>
      </div>
    );
  }

  private mouseHandlers = (target: t.TreeViewMouse['target']) => {
    const { node, onMouseParent } = this.props;
    return TreeNode.mouseHandlers(() => node, target, onMouseParent);
  };

  private parentMouseHandlers = this.props.showParentButton && this.mouseHandlers('PARENT');
}
