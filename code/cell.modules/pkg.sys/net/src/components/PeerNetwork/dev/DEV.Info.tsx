import React, { useEffect, useRef, useState } from 'react';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ObjectView } from 'sys.ui.dev';

import { usePeerState } from '../hooks';
import { Card, COLORS, css, CssValue, PropList, PropListItem, t, time } from './common';
import { Network } from './DEV.Network';

export type InfoProps = {
  id: string;
  bus: t.EventBus<any>;
  style?: CssValue;
};

export const Info: React.FC<InfoProps> = (props) => {
  const { id } = props;
  const bus = props.bus.type<t.PeerNetworkEvent>();

  const state = usePeerState({ id, bus });
  const network = state.network;

  const styles = {
    base: css({
      flex: 1,
      Flex: 'horizontal-stretch-stretch',
    }),
    left: css({
      flex: 1,
      padding: 20,
      Flex: 'vertical-stretch-stretch',
    }),
    middle: css({
      width: 80,
      Flex: 'vertical-stretch-center',
    }),
    right: css({
      flex: 1,
      padding: 20,
    }),
    card: css({
      display: 'block',
      marginBottom: 20,
      width: 300,
    }),
    verticalRule: css({
      flex: 1,
      width: 1,
      borderLeft: `solid 1px ${COLORS.MAGENTA}`,
      borderRight: `solid 1px ${COLORS.MAGENTA}`,
      opacity: 0.3,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.left}>{network && <Network network={network} />}</div>
      <div {...styles.middle}>
        <div {...styles.verticalRule} />
      </div>
      <div {...styles.right}>
        <ObjectView name={'PeerNetwork'} data={state.network} expandLevel={5} />
      </div>
    </div>
  );
};
