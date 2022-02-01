import React from 'react';
import { color, css, CssValue, k } from '../common';

export type BulletConnectorLinesProps = k.BulletProps & {
  radius?: number;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed';
  borderColor?: number | string;
  style?: CssValue;
};

export const BulletConnectorLines: React.FC<BulletConnectorLinesProps> = (props) => {
  const {
    is,
    edge,
    index,
    total,
    radius,
    borderWidth = 5,
    borderStyle = 'solid',
    borderColor = -0.1,
  } = props;
  const border = `${borderStyle} ${borderWidth}px ${color.format(borderColor)}`;
  const hasRadius = typeof radius === 'number' && total > 1;

  const styles = {
    base: css({
      Flex: 'vertical-stretch-stretch',
      minWidth: is.vertical && 60,
      minHeight: is.horizontal && 60,
    }),
    edge: {
      base: css({
        flex: 1,
        border,
        borderRight: is.vertical && edge === 'near' && 'none',
        borderLeft: is.vertical && edge === 'far' && 'none',
      }),
      top: css({
        borderBottom: 'none',
        borderLeftWidth: total < 2 ? 0 : borderWidth,
        borderRightWidth: total < 2 ? 0 : borderWidth,
      }),
      bottom: css({
        borderTop: 'none',
      }),
      spacer: css({ flex: 1 }),
      topRadius: hasRadius && {
        borderRadius: edge === 'near' ? [radius, 0, 0, 0] : [0, radius, 0, 0],
      },
      bottomRadius: hasRadius && {
        borderRadius: edge === 'near' ? [0, 0, 0, radius] : [0, 0, radius, 0],
      },
    },
    middle: {
      line: css({ borderTop: border }),
      spacer: css({
        borderRight: edge === 'far' && border,
        borderLeft: edge === 'near' && border,
        flex: 1,
      }),
    },
  };

  if (is.first) {
    return (
      <div {...css(styles.base, props.style)}>
        <div {...styles.edge.spacer} />
        <div {...css(styles.edge.base, styles.edge.top, styles.edge.topRadius)} />
      </div>
    );
  }

  if (is.last) {
    return (
      <div {...css(styles.base, props.style)}>
        <div {...css(styles.edge.base, styles.edge.bottom, styles.edge.bottomRadius)} />
        <div {...styles.edge.spacer} />
      </div>
    );
  }

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.middle.spacer} />
      <div {...css(styles.middle.line)} />
      <div {...styles.middle.spacer} />
    </div>
  );

  return <div {...css(styles.base, props.style)}></div>;
};
