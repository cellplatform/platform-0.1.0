import React from 'react';

import { css, CssValue, t } from '../../common';
import { SampleCard } from './DEV.SampleCard';
import { Doc } from './DEV.types';

export type SampleProps = {
  docs?: t.CrdtDocEvents<Doc>[];
  style?: CssValue;
};

export const Sample: React.FC<SampleProps> = (props) => {
  const { docs = [] } = props;
  const styles = {
    base: css({ Flex: 'horizontal-stretch-stretch' }),
    card: css({
      marginRight: 15,
      ':last-child': { marginRight: 0 },
    }),
  };
  const elCards = docs.map((doc, i) => <SampleCard key={i} doc={doc} style={styles.card} />);
  return <div {...css(styles.base, props.style)}>{elCards}</div>;
};
