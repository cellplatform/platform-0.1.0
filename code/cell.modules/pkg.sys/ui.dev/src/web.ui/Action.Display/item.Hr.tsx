import React from 'react';

import { css, t } from '../common';
import { Hr as HrComponent } from '../Hr';

export type HrProps = {
  namespace: string;
  bus: t.EventBus;
  item: t.ActionHr;
};

export const Hr: React.FC<HrProps> = (props) => {
  const { item } = props;

  const styles = {
    base: css({
      boxSizing: 'border-box',
      paddingLeft: item.indent,
    }),
  };

  return (
    <div {...styles.base}>
      <HrComponent
        color={0 - item.opacity}
        thickness={item.height}
        margin={item.margin}
        dashed={item.borderStyle === 'dashed'}
      />
    </div>
  );
};
