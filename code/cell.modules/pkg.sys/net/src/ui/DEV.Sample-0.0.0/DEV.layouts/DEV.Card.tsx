import React from 'react';
import {
  css,
  CssValue,
  t,
  Card,
  CardProps,
  Icons,
  Button,
  useDragTarget,
  COLORS,
} from '../DEV.common';

export type DevCardProps = {
  children?: React.ReactNode;
  width?: number;
  margin?: t.CssEdgesInput;
  padding?: t.CssEdgesInput;
  shadow?: CardProps['shadow'];
  style?: CssValue;
  onClose?: () => void;
  onDrop?: (e: t.Dropped) => void;
};

export const DevCard: React.FC<DevCardProps> = (props) => {
  const { width = 300, shadow = false, onDrop } = props;

  const drag = useDragTarget<HTMLDivElement>((e) => onDrop?.(e));

  const styles = {
    base: css({ position: 'relative' }),
    close: css({ Absolute: [5, 5, null, null] }),
    body: css({
      position: 'relative',
      filter: onDrop && drag.isDragOver ? `blur(3px)` : undefined,
      opacity: onDrop && drag.isDragOver ? 0.3 : 1,
    }),
    drag: {
      overlay: css({ Absolute: 0, Flex: 'vertical-center-center' }),
      icon: css({ marginBottom: 6, opacity: 0.2 }),
    },
  };

  const elCloseButton = props.onClose && (
    <Button style={styles.close} onClick={props.onClose}>
      <Icons.Close size={18} />
    </Button>
  );

  const elDragOverlay = onDrop && drag.isDragOver && (
    <div {...styles.drag.overlay}>
      <Icons.Upload.Box size={46} style={styles.drag.icon} color={COLORS.DARK} />
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <Card
        ref={drag.ref}
        margin={props.margin}
        padding={props.padding}
        width={width}
        shadow={shadow}
      >
        <div {...styles.body}>{props.children}</div>
        {elDragOverlay}
        {elCloseButton}
      </Card>
    </div>
  );
};
