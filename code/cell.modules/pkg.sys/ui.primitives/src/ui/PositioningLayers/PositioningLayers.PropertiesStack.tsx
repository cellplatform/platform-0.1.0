import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';
import { Card } from '../Card';
import { CardStack, CardStackItem } from '../CardStack';
import { LayerProperties } from './Layer.Properties';

export type PositioningLayersPropertiesStackProps = {
  layers?: t.PositioningLayer[];
  maxDepth?: number;
  style?: CssValue;
};

export const PositioningLayersPropertiesStack: React.FC<PositioningLayersPropertiesStackProps> = (
  props,
) => {
  const { layers = [], maxDepth = 4 } = props;
  const isEmpty = layers.length === 0;

  /**
   * Render
   */

  const styles = {
    base: css({
      position: 'relative',
      boxSizing: 'border-box',
    }),
    empty: css({
      display: 'grid',
      justifyContent: 'center',
      justifyAlign: 'center',
      fontSize: 12,
      fontStyle: 'italic',
      color: color.format(-0.3),
    }),
  };

  const el = (
    <Card padding={[10, 15]}>
      <LayerProperties />
    </Card>
  );

  const items: CardStackItem[] = layers.map((layer, i) => {
    return { id: `layer-${i}`, el: () => el };
  });

  const elEmpty = isEmpty && (
    <div {...styles.empty}>
      <div>No layers to display</div>
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {!isEmpty && <CardStack items={items} maxDepth={maxDepth} />}
      {elEmpty}
    </div>
  );
};
