import React from 'react';
import { PropList } from '../PropList';

import { css, CssValue, t } from '../../common';
import { PositioningLayerProps, PositioningSize } from './PositioningLayer';

export type PositioningLayerInfoProps = {
  props: PositioningLayerProps;
  size?: PositioningSize;
  style?: CssValue;
};

export const PositioningLayerInfo: React.FC<PositioningLayerInfoProps> = (props) => {
  const { size } = props;
  const { position } = props.props;
  const styles = { base: css({}) };

  type D = t.DomRect;
  const toSize = (size?: D) => (!size ? '-' : `${size.width} x ${size.height} px`);
  const toPosition = (size?: D) => (!size ? '-' : `x:${size.x}, y:${size.y}`);

  const items: (t.PropListItem | undefined)[] = [
    { label: 'position.x', value: position?.x ?? '-' },
    { label: 'position.y', value: position?.y ?? '-' },
    size && { label: 'parent.size', value: toSize(size.parent) },
    size && { label: 'child.size', value: toSize(size.child) },
    size && { label: 'child.position', value: toPosition(size.child) },
  ];

  return (
    <div {...css(styles.base, props.style)}>
      <PropList title={'Properties'} items={items} defaults={{ monospace: true }} />
    </div>
  );
};
