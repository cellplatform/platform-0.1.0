import React from 'react';
import { color, css, CssValue, t } from './common';
import {
  PositioningLayerConfig,
  PositioningLayerConfigChangeEventHandler,
} from '../PositioningLayer/PositioningLayer.Config';
import { PropList, PropListItem } from '../PropList';

type Index = number;

export type LayerPropertiesChange = { index: Index; layer: t.PositioningLayer };
export type LayerPropertiesChangeHandler = (e: LayerPropertiesChange) => void;

export type LayerPropertiesProps = {
  index: Index;
  layer: t.PositioningLayer;
  style?: CssValue;
  onChange?: LayerPropertiesChangeHandler;
};

export const LayerProperties: React.FC<LayerPropertiesProps> = (props) => {
  const { index, layer } = props;

  const items: PropListItem[] = [
    { label: 'foo', value: 123 },
    { label: 'foo', value: 123 },
    { label: 'foo', value: 123 },
  ];

  const handlePositionChange: PositioningLayerConfigChangeEventHandler = (e) => {
    const position = e.next;
    props.onChange?.({ index, layer: { ...layer, position } });
  };

  /**
   * Render
   */

  const styles = {
    base: css({ position: 'relative' }),
    body: css({ Flex: 'horizontal-stretch-stretch' }),
    title: css({
      marginBottom: 10,
      fontSize: 12,
      borderBottom: `solid 3px ${color.format(-0.1)}`,
      paddingBottom: 4,
      color: color.format(-0.4),
    }),
    left: css({ marginRight: 18 }),
    right: css({ flex: 1 }),
    positionConfig: {
      outer: css({ display: 'grid', justifyContent: 'center', alignContent: 'center' }),
    },
  };

  const title = `Layer ${index + 1}`;

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.title}>{title}</div>
      <div {...styles.body}>
        <div {...styles.left}>
          <div {...styles.positionConfig.outer}>
            <PositioningLayerConfig position={layer.position} onChange={handlePositionChange} />
          </div>
        </div>
        <div {...styles.right}>
          <PropList items={items} defaults={{ monospace: true }} />
        </div>
      </div>
    </div>
  );
};
