import React, { useEffect, useRef, useState } from 'react';
import { Style, Color, COLORS, css, CssValue, t, rx } from '../common';
import { FsPathListStateful } from '../FsPathList.Stateful';

export type FsPathListDevProps = {
  instance: t.FsViewInstance;
  height?: number;
  margin?: number | [number, number] | [number, number, number, number];
  style?: CssValue;
};

export const PathListDev: React.FC<FsPathListDevProps> = (props) => {
  const { instance, height = 150, margin = [5, 10, 20, 10] } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      ...Style.toMargins(margin),
    }),
    outer: css({
      height,
      borderRadius: 4,
      backgroundColor: Color.alpha(COLORS.DARK, 0.02),
      border: `solid 1px ${Color.format(-0.06)}`,
      display: 'flex',
    }),
    footer: css({
      fontFamily: 'monospace',
      color: Color.alpha(COLORS.DARK, 0.4),
      fontSize: 10,
      fontWeight: 600,
      Flex: 'x-spaceBetween-center',
      marginTop: 3,
      PaddingX: 4,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.outer}>
        <FsPathListStateful
          style={{ flex: 1 }}
          instance={instance}
          scrollable={true}
          droppable={true}
          selectable={true}
        />
      </div>
      <div {...styles.footer}>
        <div>{`${rx.bus.instance(instance.bus)}/${instance.id}`}</div>
        <div>{`${instance.fs}`}</div>
      </div>
    </div>
  );
};
