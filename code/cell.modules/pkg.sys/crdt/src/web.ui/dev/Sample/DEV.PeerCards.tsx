import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';
import { DocCard } from './DEV.DocCard';
import { SimpleDoc } from './DEV.types';

export type PeerCardsProps = {
  docs?: t.CrdtDocEvents<SimpleDoc>[];
  cardWidth?: number;
  style?: CssValue;
};

export const PeerCards: React.FC<PeerCardsProps> = (props) => {
  const { docs = [] } = props;

  const styles = {
    base: css({
      position: 'relative',
      Flex: 'horizontal-stretch-stretch',
    }),
    spacing: css({
      marginRight: 15,
      ':last-child': { marginRight: 0 },
    }),
  };

  const elCards = docs.map((doc, i) => {
    return <DocCard key={i} doc={doc} width={props.cardWidth} style={styles.spacing} />;
  });

  return <div {...css(styles.base, props.style)}>{elCards}</div>;
};
