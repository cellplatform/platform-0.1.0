import React from 'react';
import { R, color, css, CssValue, t } from './common';
import { PropList, PropListItem } from '../PropList';
import { PositioningLayoutProps } from './PositioningLayout';

type Index = number;

export type PositioningLayoutConfigProps = {
  props: PositioningLayoutProps;
  current?: Index;
  style?: CssValue;
};

export const PositioningLayoutConfig: React.FC<PositioningLayoutConfigProps> = (props) => {
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
