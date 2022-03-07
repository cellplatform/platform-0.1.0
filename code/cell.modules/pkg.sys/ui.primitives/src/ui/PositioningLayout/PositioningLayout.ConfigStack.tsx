import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, R } from './common';
import { Card } from '../Card';
import { CardStack, CardStackItem } from '../CardStack';
import { LayerProperties, LayerPropertiesChangeHandler } from './Layer.Properties';
import { Button } from '../../ui.ref/button/Button';

type Index = number;

export type PositioningLayoutConfigStackProps = {
  layers?: t.PositioningLayer[];
  current?: Index;
  maxDepth?: number;
  style?: CssValue;
  onLayerChange?: LayerPropertiesChangeHandler;
  onCurrentChange?: (e: { prev: Index; next: Index }) => void;
};

export const PositioningLayoutConfigStack: React.FC<PositioningLayoutConfigStackProps> = (
  props,
) => {
  const { layers = [], maxDepth = 3 } = props;
  const isEmpty = layers.length === 0;
  const current =
    props.current === undefined ? layers.length - 1 : R.clamp(0, layers.length, props.current);

  const sliced = layers.slice(0, current + 1);

  const navClickHandler = (direction: 'prev' | 'next') => {
    return () => {
      const prev = current;
      const next = direction === 'prev' ? prev - 1 : prev + 1;
      if (next < 0 || next > layers.length) return;
      props.onCurrentChange?.({ prev, next });
    };
  };

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
    body: css({ Flex: 'vertical-stretch-stretch' }),
    cards: css({ flex: 1 }),
    footer: css({
      Flex: 'horizontal-stretch-spaceBetween',
      paddingTop: 8,
      PaddingX: 4,
    }),
  };

  const items: CardStackItem[] = sliced.map((layer, i) => {
    return {
      id: `layer-${i}`,
      el() {
        return (
          <Card padding={[8, 10]}>
            <LayerProperties index={i} layer={layer} onChange={props.onLayerChange} />
          </Card>
        );
      },
    };
  });

  const elEmpty = isEmpty && (
    <div {...styles.empty}>
      <div>No layers to display</div>
    </div>
  );

  const elFooter = !isEmpty && (
    <div {...styles.footer}>
      <Button isEnabled={current > 0} onClick={navClickHandler('prev')}>
        Down
      </Button>
      <Button isEnabled={current < layers.length - 1} onClick={navClickHandler('next')}>
        Up
      </Button>
    </div>
  );

  const elBody = !isEmpty && (
    <div {...styles.body}>
      <CardStack items={items} maxDepth={maxDepth} {...styles.cards} />
      {elFooter}
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elBody}
      {elEmpty}
    </div>
  );
};
