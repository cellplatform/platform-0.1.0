import React from 'react';
import { R, color, css, CssValue, t } from './common';
import { PropList, PropListItem } from '../PropList';
import { PositioningLayersProps } from './PositioningLayers';

type Index = number;

export type PositioningLayersPropertiesProps = {
  props: PositioningLayersProps;
  current?: Index;
  style?: CssValue;
};

export const PositioningLayersProperties: React.FC<PositioningLayersPropertiesProps> = (props) => {
  const { current } = props;
  const { layers = [] } = props.props;
  const total = layers.length;

  const items: PropListItem[] = [
    {
      label: 'total',
      value: total === 0 ? '<none>' : `${total} ${total === 1 ? 'layer' : 'layers'}`,
    },
    {
      label: 'current',
      value: current === undefined ? `<undefined>${total === 0 ? '' : ` [${total - 1}]`}` : current,
    },
  ];

  /**
   * Render
   */
  const styles = {
    base: css({}),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <PropList title={'Properties'} items={items} defaults={{ monospace: true }} />
    </div>
  );
};
