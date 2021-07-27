import React from 'react';
import { color, css, CssValue, t } from '../../common';
import { PropList, PropListItem } from '../PropList';
import { PositioningLayersProps } from './PositioningLayers';

export type PositioningLayersPropertiesProps = {
  props: PositioningLayersProps;
  style?: CssValue;
};

export const PositioningLayersProperties: React.FC<PositioningLayersPropertiesProps> = (props) => {
  const { layers = [] } = props.props;
  const total = layers.length;

  const styles = {
    base: css({}),
  };

  const items: PropListItem[] = [
    {
      label: 'total',
      value: total === 0 ? '<none>' : `${total} ${total === 1 ? 'layer' : 'layers'}`,
    },
  ];

  return (
    <div {...css(styles.base, props.style)}>
      <PropList title={'Props'} items={items} defaults={{ monospace: true }} />
    </div>
  );
};
