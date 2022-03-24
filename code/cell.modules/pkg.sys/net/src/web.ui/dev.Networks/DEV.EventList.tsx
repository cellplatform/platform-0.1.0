import React from 'react';
import { css, CssValue, t } from './DEV.common';
import { EventList } from 'sys.ui.primitives/lib/ui/Event.List';

export type DevEventListProps = {
  network: t.PeerNetwork;
  style?: CssValue;
};

export const DevEventList: React.FC<DevEventListProps> = (props) => {
  const { network } = props;
  if (!network) return null;

  const bus = network.netbus;

  /**
   * [Render]
   */
  const styles = {
    base: css({ display: 'flex' }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <EventList bus={bus} style={{ flex: 1 }} />
    </div>
  );
};
