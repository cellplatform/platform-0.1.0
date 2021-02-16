import React, { useEffect, useRef, useState } from 'react';
import { css, CssValue, t, color } from '../common';

export type PeerLabelProps = {
  id: string;
  isSelf?: boolean;
  style?: CssValue;
};

export const PeerLabel: React.FC<PeerLabelProps> = (props) => {
  const { isSelf } = props;

  const styles = {
    base: css({
      Flex: 'horizontal-stretch-center',
      fontSize: 11,
      userSelect: 'none',
    }),
    title: css({
      backgroundColor: color.format(-0.1),
      border: `solid 1px ${color.format(-0.1)}`,
      borderRadius: 2,
      color: color.format(-0.5),
      fontWeight: 'bold',
      paddingTop: 3,
      paddingBottom: 2,
      PaddingX: 6,
      marginRight: 6,
      fontSize: 8,
    }),
    id: css({
      borderRadius: 3,
      userSelect: 'text',
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.title}>{isSelf ? 'ME' : 'PEER'}</div>
      <div {...styles.id}>{props.id}</div>
    </div>
  );
};
