import React from 'react';
import { Color, COLORS, css, CssValue, t, useDragTarget } from '../common';

export type DropTargetProps = {
  instance: t.FsViewInstance;
  targetRef: React.RefObject<HTMLDivElement>;
  theme: t.FsPathListTheme;
  style?: CssValue;
  onDrop?: t.FsPathListDroppedHandler;
  onDragOver?: (e: { isOver: boolean }) => void;
};

export const DropTarget: React.FC<DropTargetProps> = (props) => {
  const { theme, onDragOver, onDrop } = props;
  const isLight = theme === 'Light';

  const drag = useDragTarget<HTMLDivElement>({
    ref: props.targetRef,
    onDragOver,
    onDrop,
  });

  /**
   * [Render]
   */
  const styles = {
    base: css({ Absolute: 0, pointerEvents: 'none' }),
    over: {
      base: css({ Absolute: 0, Flex: 'center-center' }),
      inner: css({
        PaddingX: 25,
        PaddingY: 8,
        color: isLight ? Color.alpha(COLORS.DARK, 0.9) : Color.format(0.8),
        border: `dashed 1px ${isLight ? Color.alpha(COLORS.DARK, 0.2) : Color.format(0.2)}`,
        backgroundColor: isLight ? Color.format(0.7) : Color.format(0.2),
        borderRadius: 5,
        boxShadow: `0 0px 20px 0 ${Color.format(-0.08)}`,
      }),
    },
  };

  const elOver = drag.isDragOver && (
    <div {...styles.over.base}>
      <div {...styles.over.inner}>Drop File</div>
    </div>
  );

  return <div {...css(styles.base, props.style)}>{elOver}</div>;
};
