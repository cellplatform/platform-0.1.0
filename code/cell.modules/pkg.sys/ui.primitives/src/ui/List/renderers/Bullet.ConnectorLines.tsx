import React from 'react';
import { color, css, t } from '../common';

export type BulletConnectorLinesProps = t.ListBulletRendererArgs & {
  radius?: number;
  lineWidth?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
  lineColor?: number | string;
};

export const BulletConnectorLines: React.FC<BulletConnectorLinesProps> = (props) => {
  const {
    is,
    total,
    radius,
    lineWidth: borderWidth = 5,
    lineStyle: borderStyle = 'solid',
    lineColor: borderColor = -0.1,
    orientation,
  } = props;

  const border = `${borderStyle} ${borderWidth}px ${color.format(borderColor)}`;
  const hasRadius = typeof radius === 'number' && total > 1;

  const styles = {
    base: css({
      flex: 1,
      Flex: `${orientation}-stretch-stretch`,
      position: 'relative',
    }),
    fill: css({ flex: 1 }),
    edge: {
      vertical: {
        first: css({
          flex: 1,
          borderTop: border,
          borderLeft: !is.single && is.bullet.near && border,
          borderRight: !is.single && is.bullet.far && border,
          borderRadius: hasRadius && (is.bullet.near ? [radius, 0, 0, 0] : [0, radius, 0, 0]),
        }),
        last: css({
          flex: 1,
          borderBottom: border,
          borderLeft: !is.single && is.bullet.near && border,
          borderRight: !is.single && is.bullet.far && border,
          borderRadius: hasRadius && (is.bullet.near ? [0, 0, 0, radius] : [0, 0, radius, 0]),
        }),
      },

      horizontal: {
        first: css({
          flex: 1,
          borderLeft: border,
          borderTop: !is.single && is.bullet.near && border,
          borderBottom: !is.single && is.bullet.far && border,
          borderRadius: hasRadius && (is.bullet.near ? [radius, 0, 0, 0] : [0, 0, 0, radius]),
        }),
        last: css({
          flex: 1,
          borderRight: border,
          borderTop: !is.single && is.bullet.near && border,
          borderBottom: !is.single && is.bullet.far && border,
          borderRadius: hasRadius && (is.bullet.near ? [0, radius, 0, 0] : [0, 0, radius, 0]),
        }),
      },
    },

    middle: {
      line: css({
        borderTop: is.vertical && border,
        borderLeft: is.horizontal && border,
      }),
      spacer: css({
        flex: 1,
        borderLeft: is.vertical && is.bullet.near && border,
        borderRight: is.vertical && is.bullet.far && border,
        borderTop: is.horizontal && is.bullet.near && border,
        borderBottom: is.horizontal && is.bullet.far && border,
      }),
    },

    spacer: css({
      position: 'relative',
      flex: 1,

      borderLeft: is.vertical && is.bullet.near ? border : undefined,
      borderRight: is.vertical && is.bullet.far ? border : undefined,

      borderTop: is.horizontal && is.bullet.near ? border : undefined,
      borderBottom: is.horizontal && is.bullet.far ? border : undefined,
    }),
  };

  if (is.spacer) {
    return <div {...styles.spacer}></div>;
  }

  if (is.first) {
    return (
      <div {...styles.base}>
        <div {...styles.fill} />
        <div
          {...css(
            is.vertical && styles.edge.vertical.first,
            is.horizontal && styles.edge.horizontal.first,
          )}
        />
      </div>
    );
  }

  if (is.last) {
    return (
      <div {...styles.base}>
        <div
          {...css(
            is.vertical && styles.edge.vertical.last,
            is.horizontal && styles.edge.horizontal.last,
          )}
        />
        <div {...styles.fill} />
      </div>
    );
  }

  return (
    <div {...styles.base}>
      <div {...styles.middle.spacer} />
      <div {...css(styles.middle.line)} />
      <div {...styles.middle.spacer} />
    </div>
  );
};
