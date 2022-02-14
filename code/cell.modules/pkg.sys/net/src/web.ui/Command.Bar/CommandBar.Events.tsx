import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { css, CssValue, EventPipe, t, useEventBusHistory } from '../../common';
import { Icons } from '../Icons';

export type CommandBarEventsProps = {
  network: t.PeerNetwork;
  iconEdge?: 'Left' | 'Right';
  style?: CssValue;
};

export const CommandBarEvents: React.FC<CommandBarEventsProps> = (props) => {
  const { network, iconEdge = 'Right' } = props;
  const { netbus } = network;

  const history = useEventBusHistory(netbus);
  const [recentlyFired, setRecentlyFired] = useState(false);

  /**
   * Lifecycle
   */
  useEffect(() => {
    const dispose$ = new Subject<void>();
    const netbus$ = netbus.$.pipe(takeUntil(dispose$));

    netbus$.subscribe(() => setRecentlyFired(true));
    netbus$.pipe(debounceTime(1500)).subscribe(() => setRecentlyFired(false));

    return () => dispose$.next();
  }, []); // eslint-disable-line

  /**
   * [Render]
   */

  const styles = {
    base: css({ flex: 1, boxSizing: 'border-box', Flex: 'x-center-center' }),
    pipe: css({ flex: 1 }),
    icon: css({
      marginLeft: iconEdge === 'Right' ?? 5,
      marginRight: iconEdge === 'Left' ?? 5,
      paddingTop: 3,
      opacity: recentlyFired ? 0.9 : 0.3,
      transition: `opacity 300ms`,
    }),
  };

  const elPipe = (
    <EventPipe
      events={history.events}
      style={styles.pipe}
      theme={'Dark'}
      onEventClick={(item) => {
        console.log('event', item.event);
      }}
    />
  );

  const elIcon = (
    <div {...styles.icon}>
      <Icons.Event color={1} size={16} />
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {iconEdge === 'Left' && elIcon}
      {elPipe}
      {iconEdge === 'Right' && elIcon}
    </div>
  );
};
