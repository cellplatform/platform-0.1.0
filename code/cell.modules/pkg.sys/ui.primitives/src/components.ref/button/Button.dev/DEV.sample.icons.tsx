import React from 'react';
import { Icon } from '@platform/ui.icon';
import { MdFace } from 'react-icons/md';

import { color, css } from './common';

const Face = Icon.renderer(MdFace);

type IconContentProps = { label?: string; color?: number | string };
export const IconContent: React.FC<IconContentProps> = (props) => {
  const { label } = props;
  const styles = {
    base: css({ Flex: 'horizontal-center-center' }),
    icon: css({ marginRight: label && 3 }),
  };
  const elLabel = label && <div>{props.label}</div>;
  return (
    <div {...styles.base}>
      <Face style={styles.icon} color={color.format(props.color)} />
      {elLabel}
    </div>
  );
};
