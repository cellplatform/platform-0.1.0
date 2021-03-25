import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from './common';
import { usePeerState } from '../hooks';

import { DevActions, ObjectView } from 'sys.ui.dev';

import { Card } from 'sys.ui.primitives/lib/components/Card';

export type PeerInfoProps = {
  id: string;
  bus: t.EventBus<any>;
  style?: CssValue;
};

export const PeerInfo: React.FC<PeerInfoProps> = (props) => {
  const { id } = props;
  const bus = props.bus.type<t.PeerNetworkEvent>();

  const state = usePeerState({ id, bus });

  const styles = {
    base: css({
      padding: 30,
      flex: 1,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <ObjectView name={'PeerNetwork'} data={state.network} expandLevel={5} />
    </div>
  );
};
