import { color, css, CssValue } from '@platform/css';
import { Text } from '@platform/ui.text/lib/components/Text';
import * as React from 'react';

import { t } from '../../common';
import * as themes from '../../themes';
import { Icons } from '../Icons';
import { TreeNode } from '../TreeNode';

const SIZE = {
  BACK_BUTTON: 24,
};

export type ITreeHeaderProps = {
  custom?: React.ReactNode;
  node: t.ITreeviewNode;
  depth: number;
  renderer: t.ITreeviewRenderer;
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
    const { height } = this.props;
    const styles = {
      base: css({
        Absolute: [0, 0, null, 0],
        height,
        boxSizing: 'border-box',
        display: 'flex',
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>{this.props.custom || this.renderDefault()}</div>
    );
  }

  private renderDefault() {
    const theme = this.theme.header;
    const { title = 'Untitled' } = this.props;

    const styles = {
      base: css({
        Absolute: 0,
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
    };

    return (
      <div {...css(styles.base)}>
        <Text>
          <div {...styles.background} />
          <div {...styles.body}>
            <div {...css(styles.edge, styles.left)}>{this.renderParentButton()}</div>
            <div {...styles.title}>{title}</div>
            <div {...css(styles.edge, styles.right)} />
          </div>
        </Text>
      </div>
    );
  }

  private renderParentButton() {
    const { showParentButton } = this.props;
    if (!showParentButton) {
      return null;
    }

    const theme = this.theme.header;
    const styles = {
      base: css({
        cursor: 'pointer',
        width: SIZE.BACK_BUTTON,
        height: SIZE.BACK_BUTTON,
      }),
    };
    return (
      <div {...styles.base} {...this.parentMouseHandlers}>
        {Icons.ChevronLeft({ color: theme.chevronColor })}
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private mouseHandlers = (target: t.ITreeviewMouse['target']) => {
    const { node, onMouseParent } = this.props;
    return TreeNode.mouseHandlers(() => node, target, onMouseParent);
  };

  private parentMouseHandlers = this.props.showParentButton && this.mouseHandlers('PARENT');
}
