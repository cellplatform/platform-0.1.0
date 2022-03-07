import React, { useState } from 'react';
import { color, css, CssValue, t, COLORS } from '../../common';
import { PositioningLayer } from './PositioningLayer';

/**
 * Types
 */
type Plane = 'x' | 'y';
type SelectedMap = { top: boolean; right: boolean; bottom: boolean; left: boolean };
type EdgeButtonClickArgs = { edge: t.BoxEdge };
type GridTargetClickArgs = {
  target: { x: t.EdgePositionX; y: t.EdgePositionY };
  dblClick: boolean;
};

export type PositioningLayerConfigChangeEvent = { prev?: t.BoxPosition; next: t.BoxPosition };
export type PositioningLayerConfigChangeEventHandler = (
  e: PositioningLayerConfigChangeEvent,
) => void;

export type PositioningLayerConfigProps = {
  isEnabled?: boolean;
  position?: t.BoxPosition;
  style?: CssValue;
  onChange?: PositioningLayerConfigChangeEventHandler;
};

/**
 * Component
 */
export const PositioningLayerConfig: React.FC<PositioningLayerConfigProps> = (props) => {
  const { isEnabled = true, position } = props;
  const gutter = 12;

  const selected: SelectedMap = {
    top: ['top', 'stretch'].includes(position?.y ?? ''),
    bottom: ['bottom', 'stretch'].includes(position?.y ?? ''),
    left: ['left', 'stretch'].includes(position?.x ?? ''),
    right: ['right', 'stretch'].includes(position?.x ?? ''),
  };

  /**
   * Handlers
   */

  const handleTargetClick = (e: GridTargetClickArgs) => {
    const { x, y } = e.target;
    const prev: t.BoxPosition = { ...(position ?? {}) };
    const next: t.BoxPosition = { x, y };
    props.onChange?.({ prev, next });
  };

  /**
   * Render
   */

  const styles = {
    base: css({
      Size: 70,
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
          if (isEnabled && props.onChange) {
            const { prev, next } = modifyPosition({ prev: position, edge, selected });
            props.onChange({ prev, next });
          }
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
      <Box position={position} isEnabled={isEnabled} onClick={handleTargetClick} />
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
type EdgeButtonProps = {
  isEnabled: boolean;
  isSelected?: boolean;
  edge: t.BoxEdge;
  style?: CssValue;
  onClick?: (e: EdgeButtonClickArgs) => void;
};

const EdgeButton: React.FC<EdgeButtonProps> = (props) => {
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
    bar: css({
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
      <div {...styles.bar}></div>
    </div>
  );
};

/**
 * Box
 */
type BoxProps = {
  isEnabled: boolean;
  position?: t.BoxPosition;
  style?: CssValue;
  onClick?: (e: GridTargetClickArgs) => void;
};

const Box: React.FC<BoxProps> = (props) => {
  const { position, isEnabled } = props;
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
      minWidth: 6,
      minHeight: 6,
      borderRadius: isFill ? 3 : 6,
      backgroundColor: COLORS.DARK,
      opacity: 0.2,
      margin: 5,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      {position && (
        <PositioningLayer position={position}>
          <div {...styles.content} />
        </PositioningLayer>
      )}
      <GridTargets isEnabled={isEnabled} onClick={props.onClick} />
    </div>
  );
};

/**
 * Inner Grid Click Targets
 */
type GridTargetsProps = {
  isEnabled: boolean;
  style?: CssValue;
  onClick?: (e: GridTargetClickArgs) => void;
};
const GridTargets: React.FC<GridTargetsProps> = (props) => {
  const { isEnabled } = props;
  const gutter = 12;

  const styles = {
    base: css({
      Absolute: 0,
      display: 'grid',
      gridTemplateColumns: `${gutter}px auto ${gutter}px`,
      gridTemplateRows: `${gutter}px auto ${gutter}px`,
    }),
    target: css({
      cursor: isEnabled ? 'pointer' : 'default',
    }),
  };

  const target = (x: t.EdgePositionX, y: t.EdgePositionY) => {
    const handler = (dblClick: boolean) => {
      return () => {
        if (isEnabled) props.onClick?.({ target: { x, y }, dblClick });
      };
    };

    return <div {...styles.target} onMouseDown={handler(false)} onDoubleClick={handler(true)} />;
  };

  return (
    <div {...css(styles.base, props.style)}>
      {target('left', 'top')}
      {target('center', 'top')}
      {target('right', 'top')}

      {target('left', 'center')}
      {target('center', 'center')}
      {target('right', 'center')}

      {target('left', 'bottom')}
      {target('center', 'bottom')}
      {target('right', 'bottom')}
    </div>
  );
};

/**
 * [Helpers]
 */

const toPlane = (edge: t.BoxEdge): Plane => (['top', 'bottom'].includes(edge) ? 'y' : 'x');

const modifyPosition = (args: { prev?: t.BoxPosition; edge: t.BoxEdge; selected: SelectedMap }) => {
  const { edge, selected } = args;
  const prev = { ...(args.prev ?? {}) };

  type X = t.EdgePositionX;
  type Y = t.EdgePositionY;
  const next: t.BoxPosition = { ...prev };
  if (edge === 'top') {
    if (selected.top) {
      next.y = (selected.bottom ? 'bottom' : 'center') as Y;
    } else {
      next.y = (selected.bottom ? 'stretch' : 'top') as Y;
    }
  }
  if (edge === 'bottom') {
    if (selected.bottom) {
      next.y = (selected.top ? 'top' : 'center') as Y;
    } else {
      next.y = (selected.top ? 'stretch' : 'bottom') as Y;
    }
  }

  if (edge === 'left') {
    if (selected.left) {
      next.x = (selected.right ? 'right' : 'center') as X;
    } else {
      next.x = (selected.right ? 'stretch' : 'left') as X;
    }
  }

  if (edge === 'right') {
    if (selected.right) {
      next.x = (selected.left ? 'left' : 'center') as X;
    } else {
      next.x = (selected.left ? 'stretch' : 'right') as X;
    }
  }

  return { prev, next };
};
