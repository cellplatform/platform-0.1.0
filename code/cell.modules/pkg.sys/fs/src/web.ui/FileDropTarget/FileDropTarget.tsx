import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, useDragTarget, MinSize } from './common';

export type FileDropTargetProps = {
  style?: CssValue;
  onDrop?: (e: t.Dropped) => void;
};

export const FileDropTarget: React.FC<FileDropTargetProps> = (props) => {
  const drag = useDragTarget<HTMLDivElement>((e) => props.onDrop?.(e));

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
    }),
    over: {
      base: css({ Absolute: 0, Flex: 'center-center' }),
      inner: css({
        PaddingX: 25,
        PaddingY: 8,
        border: `dashed 1px ${color.format(-0.2)}`,
        backgroundColor: color.format(0.7),
        borderRadius: 5,
      }),
    },
    empty: {
      base: css({
        Absolute: 0,
        Flex: 'center-center',
        color: color.format(-0.3),
        fontSize: 12,
        fontStyle: 'italic',
        backdropFilter: `blur(15px)`,
        backgroundColor: color.format(0.8),
      }),
    },
  };

  const elOver = drag.isDragOver && (
    <div {...styles.over.base}>
      <div {...styles.over.inner}>Drop File</div>
    </div>
  );

  const elEmpty = !elOver && <div {...styles.empty.base}>Nothing to display.</div>;

  return (
    <div ref={drag.ref} {...css(styles.base, props.style)}>
      {elEmpty}
      {elOver}
    </div>
  );
};
