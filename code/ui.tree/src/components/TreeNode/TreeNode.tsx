import * as React from 'react';
import {
  css,
  GlamorValue,
  mouse,
  TreeNodeMouseEvent,
  TreeNodeMouseEventHandler,
  ITreeNode,
  t,
  tree,
  value,
} from '../../common';
import * as themes from '../../themes';
import { Text } from '../Text';
import { Icons, IIcon } from '../Icons';
import { Spinner } from '../primitives';

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
  iconRight?: IIcon | null;
  twisty?: TreeNodeTwisty;
  theme?: themes.ITreeTheme;
  background?: 'THEME' | 'NONE';
  style?: GlamorValue;
  onMouse?: TreeNodeMouseEventHandler;
};

export class TreeNode extends React.PureComponent<ITreeNodeProps> {
  private get theme() {
    return themes.themeOrDefault(this.props);
  }

  private get nodeProps() {
    const { node } = this.props;
    return node.props || {};
  }

  private get backgroundColor() {
    const { background = 'THEME' } = this.props;
    if (background === 'NONE') {
      return;
    }
    const theme = this.theme;
    const props = this.nodeProps;
    return props.isSelected ? theme.node.selected.bgColor : undefined;
  }

  public render() {
    const props = this.nodeProps;
    const isEnabled = value.defaultValue(props.isEnabled, true);
    const padding = css.arrayToEdges(props.padding) || DEFAULT.PADDING;
    const styles = {
      base: css({
        position: 'relative',
        boxSizing: 'border-box',
        paddingTop: padding[0],
        paddingRight: padding[1],
        paddingBottom: padding[2],
        paddingLeft: padding[3],
        marginTop: props.marginTop,
        marginBottom: props.marginBottom,
        userSelect: 'none',
        backgroundColor: this.backgroundColor,
      }),
      body: css({
        position: 'relative',
        Flex: 'horizontal-start-stretch',
        opacity: isEnabled ? 1 : 0.3,
      }),
    };

    const elBorders = this.renderBorders();
    const elTwisty = this.renderTwisty();
    const elIconLeft = this.renderIconLeft();
    const elLabel = this.renderLabel();
    const elIconRight = this.renderIconRight();

    return (
      <Text style={css(styles.base, this.props.style)} {...this.nodeHandlers}>
        {elBorders}
        <div {...styles.body}>
          {elTwisty}
          {elIconLeft}
          {elLabel}
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
    const elIcon = twisty !== null && (
      <Icons.PlayArrow size={SIZE.TWISTY_ICON} color={theme.chevronColor} />
    );
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
      return (
        <div {...styles.base}>
          {fn({
            style: styles.icon,
            size: SIZE.ICON_LEFT,
            color: theme.labelColor,
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
    const isActive = iconRight !== null;
    const styles = {
      base: css({
        Absolute: [0, 0, null, null],
        width: SIZE.ICON_RIGHT,
        height: SIZE.ICON_RIGHT,
        cursor: isActive && 'pointer',
      }),
    };

    const elIcon = iconRight && iconRight({ color: theme.chevronColor });
    const handlers = isActive && this.drillInHandlers;

    return (
      <div {...styles.base} {...handlers}>
        {elIcon}
      </div>
    );
  }

  private renderLabel() {
    const theme = this.theme.node;
    const { node, iconRight } = this.props;
    const props = this.nodeProps;
    const label = props.label || node.id;
    const styles = {
      base: css({
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        marginLeft: MARGIN.LABEL_LEFT,
      }),
      labelOuter: css({
        Flex: 'horizontal-center-spaceBetween',
        marginRight: iconRight !== undefined ? SIZE.ICON_RIGHT : MARGIN.LABEL_RIGHT,
      }),
      label: css({
        boxSizing: 'border-box',
        flex: 1,
        paddingTop: 4,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        height: SIZE.LABEL,
        color: theme.labelColor,
        fontSize: 14,
        fontWeight: props.isBold ? 900 : undefined,
      }),
    };

    const elSpinner = props.isSpinning && <Spinner color={this.theme.spinner} size={18} />;

    return (
      <div {...styles.base}>
        <div {...styles.labelOuter}>
          <div {...styles.label}>{label}</div>
          {elSpinner || this.renderBadge()}
        </div>
        {this.renderDescription()}
        {this.props.children}
      </div>
    );
  }

  private renderDescription() {
    const props = this.nodeProps;
    if (!props.description) {
      return;
    }
    const theme = this.theme.node;
    const { iconRight } = this.props;
    const styles = {
      base: css({
        fontSize: 11,
        color: theme.labelColor,
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
        color: theme.color,
        background: theme.bgColor,
        border: `solid 1px ${theme.borderColor}`,
        textShadow: Text.toShadow([-1, theme.textShadow]),
        fontSize: 11,
        margin: 0,
        marginLeft: 6,
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
    const props = this.nodeProps;

    const borderTopColor = themes.color(props.borderTop, theme.borderTopColor);
    const borderBottomColor = themes.color(props.borderBottom, theme.borderBottomColor);

    const styles = {
      top: css({
        Absolute: [0, 0, null, 0],
        height: 1,
        borderTop: `solid 1px ${borderTopColor || 'transparent'}`,
      }),
      bottom: css({
        Absolute: [null, 0, 0, 0],
        height: 1,
        borderBottom: `solid 1px ${borderBottomColor || 'transparent'}`,
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
      e.cancel();
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
