import React, { useEffect, useRef, useState } from 'react';

import { PropList, PropListItem } from '../../PropList';
import { color, css, CssValue, t } from '../common';

export type SampleProps = {
  id: string;
  info?: t.PositioningLayerInfo;
  overlaps: t.PositioningLayerOverlapInfo[];
  find: t.PositioningLayersQuery;
  style?: CssValue;
};

export const Sample: React.FC<SampleProps> = (props) => {
  const { info, id, find, overlaps } = props;

  /**
   * Render
   */
  const styles = {
    base: css({
      flex: 1,
      userSelect: 'none',
      position: 'relative',
      border: `dashed 1px ${color.format(-0.15)}`,
      borderRadius: 8,
      Padding: [10, 15, 10, 8],
      minWidth: 250,
      margin: 3,
      backgroundColor: color.format(-0.03),
    }),
    hand: css({ Absolute: [-8, -8, null, null] }),
    info: css({
      fontSize: 10,
    }),
  };

  const items: PropListItem[] = (() => {
    const index = info ? `${info.index}` : '?';
    const list: PropListItem[] = [{ label: `layer-${index}`, value: `id:"${props.id}"` }];
    if (info) {
      const { position, size } = info;
      list.push(
        ...[
          { label: 'position (x, y)', value: `${position.x} ${position.y}` },
          { label: 'size', value: `x:${size.x} y:${size.y}, ${size.width} x ${size.height} px` },
        ],
      );

      overlaps.forEach((overlap) => {
        const { index, x, y } = overlap;
        list.push({
          label: `overlaps with: layer-${index}`,
          value: `${x ? 'x' : ''}${y ? 'y' : ''}`,
        });
      });
    }

    return list;
  })();

  return (
    <div
      {...css(styles.base, props.style)}
      onClick={() => {
        console.log('lookup:', find.first(id));
      }}
    >
      <div {...styles.hand}>👋</div>
      <PropList items={items} defaults={{ clipboard: false, monospace: true }} />
    </div>
  );
};
