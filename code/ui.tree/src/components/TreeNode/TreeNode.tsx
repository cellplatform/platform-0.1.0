import * as React from 'react';

import {
  color,
  css,
  GlamorValue,
  ITreeNode,
  mouse,
  t,
  tree,
  TreeNodeMouseEvent,
  TreeNodeMouseEventHandler,
  defaultValue,
} from '../../common';
import * as themes from '../../themes';
import { Icons, IIcon } from '../Icons';
import { Spinner } from '../primitives';
import { Text } from '../Text';

const DEFAULT = {
  PADDING: [5, 0, 5, 5],
};
const SIZE = {
  LABEL: 24,
  ICON_LEFT: 18,
  ICON_RIGHT: 24,
  TWISTY_ICON: 16,
  TWISTY_WIDTH: 18,
};
const MARGIN = {
  LABEL_LEFT: 4,
  LABEL_RIGHT: 8,
};

export { TreeNodeMouseEvent, TreeNodeMouseEventHandler, ITreeNode };

export type TreeNodeTwisty = 'OPEN' | 'CLOSED' | null;

export type ITreeNodeProps = {
  children?: React.ReactNode;
  node: ITreeNode;
  renderIcon?: t.RenderTreeIcon;
  renderNodeBody?: t.RenderTreeNodeBody;
  iconRight?: IIcon | null;
  twisty?: TreeNodeTwisty;
  theme?: themes.ITreeTheme;
  background?: 'THEME' | 'NONE';
  isFocused: boolean;
  isInline?: boolean;
  isFirst: boolean;
  isLast: boolean;
  style?: GlamorValue;
  onMouse?: TreeNodeMouseEventHandler;
};

export class TreeNode extends React.PureComponent<ITreeNodeProps> {
  /**
   * [Properties]
   */
  public get id() {
    return this.props.node.id;
  }

  private get nodeProps() {
    const { node } = this.props;
    return node.props || {};
  }

  private get theme() {
    return themes.themeOrDefault(this.props);
  }

  private get colors() {
    const props = this.nodeProps;
    const colors = props.colors || {};
    return this.props.isFocused ? { ...colors, ...props.focusColors } : colors;
  }

  private get backgroundColor() {
    const props = this.nodeProps;
    const color = this.colors;
    if (color.bg) {
      return color.bg;
    }

    const { background = 'THEME' } = this.props;
    if (background === 'NONE') {
      return;
    }
    const theme = this.theme;
    return props.isSelected ? theme.node.selected.bgColor : undefined;
  }

  private get isEnabled() {
    return defaultValue(this.nodeProps.isEnabled, true);
  }

  private get opacity() {
    return defaultValue(this.nodeProps.opacity, 1);
  }

  /**
   * [Render]
   */

  public render() {
    const props = this.nodeProps;
    const isEnabled = this.isEnabled;
    const padding = css.toPadding(props.padding, { defaultValue: DEFAULT.PADDING });
    const opacity = this.opacity;
    const styles = {
      base: css({
        ...padding,
        position: 'relative',
        boxSizing: 'border-box',
        marginTop: props.marginTop,
        marginBottom: props.marginBottom,
        userSelect: 'none',
        backgroundColor: color.format(this.backgroundColor),
      }),
      inner: css({
        position: 'relative',
        Flex: 'horizontal-start-stretch',
        opacity: isEnabled ? opacity : Math.min(0.3, opacity),
        transition: 'opacity 0.2s',
      }),
    };

    const elBorders = this.renderBorders();
    const elTwisty = this.renderTwisty();
    const elIconLeft = this.renderIconLeft();
    const elContent = this.renderContent();
    const elIconRight = this.renderIconRight();

    return (
      <Text style={css(styles.base, this.props.style)} {...this.nodeHandlers}>
        {elBorders}
        <div {...styles.inner}>
          {elTwisty}
          {elIconLeft}
          {elContent}
          {elIconRight}
        </div>
      </Text>
    );
  }

  private renderTwisty() {
    const theme = this.theme.node;
    const { twisty } = this.props;
    if (twisty === undefined) {
      return;
    }
    const styles = {
      base: css({
        width: SIZE.TWISTY_WIDTH,
        height: SIZE.LABEL,
        Flex: 'center-center',
        transform: `rotate(${twisty === 'OPEN' ? 90 : 0}deg)`,
        transition: `transform 0.2s`,
      }),
    };

    const color = this.colors.twisty || this.colors.chevron || theme.chevronColor;
    const elIcon = twisty !== null && <Icons.PlayArrow size={SIZE.TWISTY_ICON} color={color} />;
    return (
      <div {...styles.base} {...this.twistyHandlers}>
        {elIcon}
      </div>
    );
  }

  private renderIconLeft() {
    const { node, renderIcon } = this.props;
    const theme = this.theme.node;
    const props = this.nodeProps;
    const icon = props.icon;
    const styles = {
      base: css({
        width: SIZE.LABEL,
        height: SIZE.LABEL,
        Flex: 'center-center',
      }),
      icon: css({
        width: SIZE.ICON_LEFT,
        height: SIZE.ICON_LEFT,
      }),
    };

    if (icon === null) {
      return <div {...styles.base} />;
    }

    let fn: IIcon | undefined;
    if (typeof icon === 'string' && renderIcon) {
      fn = renderIcon({ icon, node });
      fn = fn ? fn : Icons.NotFound;
    }

    if (fn) {
      const colors = this.colors;
      return (
        <div {...styles.base}>
          {fn({
            style: styles.icon,
            size: SIZE.ICON_LEFT,
            color: colors.icon ? color.format(colors.icon) : theme.labelColor,
          })}
        </div>
      );
    }

    return;
  }

  private renderIconRight() {
    const { iconRight } = this.props;
    if (iconRight === undefined) {
      return;
    }
    const theme = this.theme.node;
    const isActive = this.isEnabled && iconRight !== null;
    const styles = {
      base: css({
        Absolute: [0, 0, null, null],
        width: SIZE.ICON_RIGHT,
        height: SIZE.ICON_RIGHT,
        cursor: isActive ? 'pointer' : undefined,
      }),
    };

    const colors = this.colors;
    const color = colors.chevron || theme.chevronColor;
    const elIcon = iconRight && iconRight({ color });
    const handlers = isActive && this.drillInHandlers;

    return (
      <div {...styles.base} {...handlers}>
        {elIcon}
      </div>
    );
  }

  private renderContent() {
    const { iconRight, renderNodeBody, node, isFocused } = this.props;
    const props = this.nodeProps;
    const body = props.body;
    const styles = {
      base: css({
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        marginLeft: MARGIN.LABEL_LEFT,
      }),
      contentOuter: css({
        minHeight: 24,
        boxSizing: 'border-box',
        position: 'relative',
        Flex: 'horizontal-stretch-spaceBetween',
        marginRight: iconRight !== undefined ? SIZE.ICON_RIGHT : MARGIN.LABEL_RIGHT,
      }),
      suffix: css({
        Flex: 'center-center',
        paddingLeft: 6,
      }),
    };

    const elSpinner = props.isSpinning && <Spinner color={this.theme.spinner} size={18} />;
    const elBody = renderNodeBody && body ? renderNodeBody({ body, node, isFocused }) : undefined;
    const elLabel = elBody ? elBody : this.renderLabel();
    const elSuffix = elSpinner || this.renderBadge();

    return (
      <div {...styles.base}>
        <div {...styles.contentOuter}>
          {elLabel}
          {elSuffix && <div {...styles.suffix}>{elSuffix}</div>}
        </div>
        {this.renderDescription()}
        {this.props.children}
      </div>
    );
  }

  private renderLabel() {
    const theme = this.theme.node;
    const { node } = this.props;
    const props = this.nodeProps;
    const label = props.label || node.id;
    const colors = this.colors;
    const labelColor = colors.label ? color.format(colors.label) : theme.labelColor;
    const styles = {
      label: css({
        boxSizing: 'border-box',
        flex: 1,
        paddingTop: 4,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        height: SIZE.LABEL,
        color: color.format(labelColor),
        fontSize: 14,
        fontWeight: props.isBold ? 'bold' : undefined,
      }),
    };
    return <div {...styles.label}>{label}</div>;
  }

  private renderDescription() {
    const props = this.nodeProps;
    if (!props.description) {
      return;
    }
    const theme = this.theme.node;
    const { iconRight } = this.props;
    const colors = this.colors;
    const styles = {
      base: css({
        fontSize: 11,
        color: color.format(colors.description ? colors.description : theme.labelColor),
        lineHeight: '1.5em',
        paddingBottom: 4,
        marginRight: iconRight !== undefined ? SIZE.ICON_RIGHT : MARGIN.LABEL_RIGHT,
      }),
    };
    return <div {...styles.base}>{props.description}</div>;
  }

  private renderBadge() {
    const theme = this.theme.node.statusBadge;
    const { badge } = this.nodeProps;
    if (!badge) {
      return;
    }
    const styles = {
      statusBadge: css({
        position: 'relative',
        boxSizing: 'border-box',
        borderRadius: 10,
        color: color.format(theme.color),
        background: color.format(theme.bgColor),
        border: `solid 1px ${theme.borderColor}`,
        textShadow: Text.toShadow([-1, theme.textShadow]),
        fontSize: 11,
        margin: 0,
        padding: 0,
        paddingTop: 1,
        PaddingX: 8,
        height: 16,
        overflow: 'hidden',
        Flex: 'horizontal-center-center',
      }),
    };
    return <div {...styles.statusBadge}>{badge}</div>;
  }

  private renderBorders() {
    const theme = this.theme.node;
    const colors = this.colors;
    const { isFirst } = this.props;

    type Color = string | number | boolean | undefined;
    let topColor: Color;
    let bottomColor: Color;

    if (colors.borderTop !== undefined) {
      topColor = colors.borderTop;
    } else if (isFirst) {
      topColor = false;
    }

    if (colors.borderBottom !== undefined) {
      bottomColor = colors.borderBottom;
    }

    topColor = themes.color(topColor, theme.borderTopColor);

    const styles = {
      top: css({
        Absolute: [0, 0, null, 0],
        height: 1,
        borderTop: `solid 1px ${color.format(topColor)}`,
      }),
      bottom: css({
        Absolute: [null, 0, 0, 0],
        height: 1,
        borderBottom: `solid 1px ${color.format(bottomColor)}`,
      }),
    };
    return (
      <React.Fragment>
        <div {...styles.top} />
        <div {...styles.bottom} />
      </React.Fragment>
    );
  }

  private mouseHandlers = (target: TreeNodeMouseEvent['target']) => {
    const { onMouse } = this.props;
    return TreeNode.mouseHandlers(() => this.props.node, target, onMouse);
  };
  public static mouseHandlers(
    getNode: () => ITreeNode,
    target: TreeNodeMouseEvent['target'],
    onMouse?: TreeNodeMouseEventHandler,
  ) {
    const handlers = mouse.handlers(e => {
      const node = getNode();
      const props = node.props || {};
      const children = tree.children(node);
      if (onMouse) {
        onMouse({ ...e, id: node.id, target, node, props, children });
      }
    });
    type Handler = React.MouseEventHandler;
    const events = handlers.events;
    const onClick = events.onClick as Handler;
    const onDoubleClick = events.onDoubleClick as Handler;
    const onMouseDown = events.onMouseDown as Handler;
    const onMouseUp = events.onMouseUp as Handler;
    const onMouseEnter = events.onMouseEnter as Handler;
    const onMouseLeave = events.onMouseLeave as Handler;
    return { onClick, onDoubleClick, onMouseDown, onMouseUp, onMouseEnter, onMouseLeave };
  }

  private nodeHandlers = this.mouseHandlers('NODE');
  private twistyHandlers = this.mouseHandlers('TWISTY');
  private drillInHandlers = this.mouseHandlers('DRILL_IN');
}
