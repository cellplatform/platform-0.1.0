import React from 'react';

import { css, CssValue, t } from '../../common';
import { PeerCards } from './DEV.PeerCards';
import { SimpleDoc } from './DEV.types';
import { Connectors } from './DEV.Connectors';

export type SampleProps = {
  docs?: t.CrdtDocEvents<SimpleDoc>[];
  style?: CssValue;
};

export const Sample: React.FC<SampleProps> = (props) => {
  const { docs = [] } = props;
  if (docs.length === 0) return null;

  const styles = {
    base: css({ position: 'relative' }),
    footer: css({ position: 'relative' }),
  };

  const elFooter = (
    <div {...styles.footer}>
      <Connectors />
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <PeerCards docs={docs} />
      {elFooter}
    </div>
  );
};
