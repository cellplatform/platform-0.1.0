import React from 'react';
import { PropList, PropListItem } from '../PropList';

import { css, CssValue } from '../../common';
import { PositioningContainerProps } from './PositioningContainer';

export type PositioningContainerPropertiesProps = {
  props: PositioningContainerProps;
  style?: CssValue;
};

export const PositioningContainerProperties: React.FC<PositioningContainerPropertiesProps> = (
  props,
) => {
  const { position } = props.props;
  const styles = {
    base: css({}),
  };

  const items: PropListItem[] = [
    { label: 'position.x', value: position?.x ?? '-' },
    { label: 'position.y', value: position?.y ?? '-' },
  ];

  return (
    <div {...css(styles.base, props.style)}>
      <PropList title={'Props'} items={items} defaults={{ monospace: true }} />
    </div>
  );
};
