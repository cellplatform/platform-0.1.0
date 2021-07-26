import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, COLORS } from '../../common';
import { PositioningContainer } from './PositioningContainer';

type ButtonClickArgs = { edge: t.BoxEdge };
type SelectedMap = { top: boolean; right: boolean; bottom: boolean; left: boolean };
type Plane = 'x' | 'y';

export type PositioningContainerConfigChangeEvent = { prev?: t.BoxPosition; next: t.BoxPosition };
export type PositioningContainerConfigChangeEventHandler = (
  e: PositioningContainerConfigChangeEvent,
) => void;

export type PositioningContainerConfigProps = {
  isEnabled?: boolean;
  position?: t.BoxPosition;
  style?: CssValue;
  onChange?: PositioningContainerConfigChangeEventHandler;
};

export const PositioningContainerConfig: React.FC<PositioningContainerConfigProps> = (props) => {
  const { isEnabled = true, position } = props;
  const gutter = 15;

  const selected: SelectedMap = {
    top: ['top', 'stretch'].includes(position?.y ?? ''),
    bottom: ['bottom', 'stretch'].includes(position?.y ?? ''),
    left: ['left', 'stretch'].includes(position?.x ?? ''),
    right: ['right', 'stretch'].includes(position?.x ?? ''),
  };

  /**
   * Render
   */
  const styles = {
    base: css({
      Size: 75,
      boxSizing: 'border-box',
      display: 'grid',
      gridTemplateColumns: `${gutter}px auto ${gutter}px`,
      gridTemplateRows: `${gutter}px auto ${gutter}px`,
    }),
  };

  const renderButton = (edge: t.BoxEdge) => {
    return (
      <EdgeButton
        edge={edge}
        isSelected={selected[edge]}
        isEnabled={isEnabled}
        onClick={(e) => {
          if (!isEnabled || !props.onChange) return;
          const { prev, next } = modifyPosition({ prev: position, edge, selected });
          props.onChange({ prev, next });
        }}
      />
    );
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div />
      {renderButton('top')}
      <div />

      {renderButton('left')}
      <Box position={position} />
      {renderButton('right')}

      <div />
      {renderButton('bottom')}
      <div />
    </div>
  );
};

/**
 * Button
 */
type ButtonProps = {
  isEnabled?: boolean;
  isSelected?: boolean;
  edge: t.BoxEdge;
  style?: CssValue;
  onClick?: (e: ButtonClickArgs) => void;
};

const EdgeButton: React.FC<ButtonProps> = (props) => {
  const { edge, isEnabled = true } = props;
  const isSelected = Boolean(props.isSelected);
  const plane = toPlane(edge);
  const [isOver, setIsOver] = useState<boolean>(false);

  /**
   * Render
   */
  const targetSize = 6;

  const backgroundColor = (() => {
    if (!isEnabled) return isSelected ? color.format(-0.1) : color.format(0);
    if (isSelected) return COLORS.BLUE;
    if (isOver) return color.format(-0.2);
    return color.format(-0.1);
  })();

  const borderRadius = (() => {
    if (edge === 'top') return `${targetSize}px ${targetSize}px 0 0`;
    if (edge === 'bottom') return `0 0 ${targetSize}px ${targetSize}px`;
    if (edge === 'right') return `0 ${targetSize}px ${targetSize}px 0`;
    if (edge === 'left') return `${targetSize}px 0 0 ${targetSize}px`;
    return;
  })();

  const styles = {
    base: css({
      position: 'relative',
      display: 'grid',
      cursor: isEnabled ? 'pointer' : 'default',
    }),
    inner: css({
      backgroundColor,
      borderRadius,
      justifySelf: plane === 'x' ? 'stretch' : 'center',
      alignSelf: plane === 'x' ? 'center' : 'stretch',
      height: plane === 'x' && targetSize,
      width: plane === 'y' && targetSize,
    }),
  };
  return (
    <div
      {...css(styles.base, props.style)}
      onMouseEnter={() => setIsOver(true)}
      onMouseLeave={() => setIsOver(false)}
      onMouseDown={(e) => {
        if (isEnabled) props.onClick?.({ edge });
      }}
    >
      <div {...styles.inner}></div>
    </div>
  );
};

/**
 * Box
 */
type BoxProps = {
  position?: t.BoxPosition;
  style?: CssValue;
};

const Box: React.FC<BoxProps> = (props) => {
  const { position } = props;
  const isFill = position?.x === 'stretch' && position?.y === 'stretch';
  const styles = {
    base: css({
      boxSizing: 'border-box',
      position: 'relative',
      justifySelf: 'stretch',
      alignSelf: 'stretch',
      borderRadius: 5,
      margin: 3,
      backgroundColor: color.format(-0.04),
      border: `solid 1px ${color.format(-0.18)}`,
      display: 'grid',
      justifyContent: 'stretch',
      alignContent: 'stretch',
    }),
    content: css({
      flex: 1,
      minWidth: 5,
      minHeight: 5,
      borderRadius: isFill ? 3 : 5,
      backgroundColor: COLORS.DARK,
      opacity: 0.2,
      margin: 5,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      {position && (
        <PositioningContainer position={position}>
          <div {...styles.content} />
        </PositioningContainer>
      )}
    </div>
  );
};

/**
 * [Helpers]
 */

const toPlane = (edge: t.BoxEdge): Plane => (['top', 'bottom'].includes(edge) ? 'y' : 'x');

const modifyPosition = (args: { prev?: t.BoxPosition; edge: t.BoxEdge; selected: SelectedMap }) => {
  const { edge, selected } = args;
  const prev = args.prev ? { ...args.prev } : {};

  type X = t.EdgePositionX;
  type Y = t.EdgePositionY;
  const next: t.BoxPosition = { ...prev };
  if (edge === 'top') {
    if (selected.top) {
      next.y = next.y === 'stretch' ? 'top' : ((selected.bottom ? 'bottom' : 'center') as Y);
    } else {
      next.y = (selected.bottom ? 'stretch' : 'top') as Y;
    }
  }
  if (edge === 'bottom') {
    if (selected.bottom) {
      next.y = next.y === 'stretch' ? 'bottom' : ((selected.top ? 'top' : 'center') as Y);
    } else {
      next.y = (selected.top ? 'stretch' : 'bottom') as Y;
    }
  }

  if (edge === 'left') {
    if (selected.left) {
      next.x = next.x === 'stretch' ? 'left' : ((selected.right ? 'right' : 'center') as X);
    } else {
      next.x = (selected.right ? 'stretch' : 'left') as X;
    }
  }

  if (edge === 'right') {
    if (selected.right) {
      next.x = next.x === 'stretch' ? 'right' : ((selected.left ? 'left' : 'center') as X);
    } else {
      next.x = (selected.left ? 'stretch' : 'right') as X;
    }
  }

  return { prev, next };
};
