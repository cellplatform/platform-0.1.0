import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';
import { PositioningContainer } from '../PositioningContainer';

export type PositioningLayersProps = {
  layers?: t.PositioningLayer[];
  style?: CssValue;
};

/**
 * Manages a stack of <PositioningContainer> elements as layers.
 */
export const PositioningLayers: React.FC<PositioningLayersProps> = (props) => {
  const { layers = [] } = props;

  /**
   * Render
   */
  const styles = {
    base: css({ position: 'relative' }),
    layer: {
      container: css({ Absolute: 0 }),
    },
  };

  const elLayers = layers.map((layer, i) => {
    const el = wrangleBody(layer.body);
    return (
      <PositioningContainer key={i} style={styles.layer.container} position={layer.position}>
        {el}
      </PositioningContainer>
    );
  });

  return <div {...css(styles.base, props.style)}>{elLayers}</div>;
};

/**
 * Helpers
 */

function wrangleBody(input: t.PositioningLayer['body']) {
  if (!input) return null;
  if (typeof input === 'function') return input();
  return input;
}
