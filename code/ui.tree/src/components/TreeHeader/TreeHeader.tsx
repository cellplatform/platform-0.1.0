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
  node: t.ITreeViewNode;
  depth: number;
  renderer: t.ITreeViewRenderer;
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

    const elCustom = this.renderCustom();
    const elDefault = !elCustom && elCustom !== null ? this.renderDefault() : undefined;

    return (
      <div {...css(styles.base, this.props.style)}>
        {elCustom}
        {elDefault}
      </div>
    );
  }

  private renderCustom() {
    const { renderer, node, depth } = this.props;
    const isFocused = Boolean(this.props.isFocused);
    return renderer.header({ node, depth, isFocused });
  }

  private renderDefault() {
    const theme = this.theme.header;
    const { title = 'Untitled', showParentButton } = this.props;

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
      <div {...css(styles.base)}>
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

  private mouseHandlers = (target: t.ITreeViewMouse['target']) => {
    const { node, onMouseParent } = this.props;
    return TreeNode.mouseHandlers(() => node, target, onMouseParent);
  };

  private parentMouseHandlers = this.props.showParentButton && this.mouseHandlers('PARENT');
}
