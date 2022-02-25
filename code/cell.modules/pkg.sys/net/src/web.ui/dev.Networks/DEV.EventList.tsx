import React from 'react';
import { css, CssValue, t, useEventBusHistory } from './DEV.common';
import { EventList } from 'sys.ui.primitives/lib/ui/Event.List';

export type DevEventListProps = {
  network: t.PeerNetwork;
  style?: CssValue;
};

export const DevEventList: React.FC<DevEventListProps> = (props) => {
  const { network } = props;
  const history = useEventBusHistory(network.netbus, { insertAt: 'Start' });

  if (!network) return null;

  /**
   * [Render]
   */
  const styles = {
    base: css({ display: 'flex' }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <EventList items={history.events} style={{ flex: 1 }} />
    </div>
  );
};
