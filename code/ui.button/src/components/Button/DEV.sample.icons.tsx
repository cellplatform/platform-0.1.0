import React from 'react';
import { Icon } from '@platform/ui.icon';
import { MdFace } from 'react-icons/md';

import { color, css } from '../../common';

const icon = Icon.renderer;
export const Icons = {
  Face: icon(MdFace),
};

export type IconButtonContentProps = { label?: string; color?: number | string };
export const IconButtonContent: React.FC<IconButtonContentProps> = (props) => {
  const { label } = props;
  const styles = {
    base: css({ Flex: 'horizontal-center-center' }),
    icon: css({ marginRight: label && 3 }),
  };
  const elLabel = label && <div>{props.label}</div>;
  return (
    <div {...styles.base}>
      <Icons.Face style={styles.icon} color={color.format(props.color)} />
      {elLabel}
    </div>
  );
};
