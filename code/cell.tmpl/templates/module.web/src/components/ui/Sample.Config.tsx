import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';
import { PropList, PropListItem } from 'sys.ui.primitives/lib/ui/PropList';
import { SampleProps } from './Sample';

export type SampleConfigProps = {
  props: SampleProps;
  style?: CssValue;
};

export const SampleConfig: React.FC<SampleConfigProps> = (props) => {
  const styles = {
    base: css({
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    }),
  };

  const items: PropListItem[] = [
    { label: 'foo', value: `1234` },
    { label: 'foo', value: `5678` },
  ];

  return (
    <div {...css(styles.base, props.style)}>
      <PropList title={'Props'} items={items} />
    </div>
  );
};
