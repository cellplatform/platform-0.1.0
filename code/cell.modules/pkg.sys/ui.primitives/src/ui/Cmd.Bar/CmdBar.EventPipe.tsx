import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { useEventHistory } from '../Event';
import { EventPipe, EventPipeItemClickEventHandler } from '../Event.Pipe';
import { css, CssValue, Icons, t } from './common';

export type CmdBarEventPipeProps = {
  bus?: t.EventBus<any>;
  iconEdge?: 'Left' | 'Right';
  style?: CssValue;
  onEventClick?: EventPipeItemClickEventHandler;
};

export const CmdBarEventPipe: React.FC<CmdBarEventPipeProps> = (props) => {
  const { bus, iconEdge = 'Right' } = props;

  const history = useEventHistory(bus);
  const [recentlyFired, setRecentlyFired] = useState(false);

  /**
   * Lifecycle
   */
  useEffect(() => {
    const dispose$ = new Subject<void>();

    if (bus) {
      const bus$ = bus.$.pipe(takeUntil(dispose$));
      bus$.subscribe(() => setRecentlyFired(true));
      bus$.pipe(debounceTime(1500)).subscribe(() => setRecentlyFired(false));
    }

    return () => {
      dispose$.next();
    };
  }, [bus]); // eslint-disable-line

  // NB: Reset this history log when/if the bus instance changes.
  useEffect(() => history.reset(), [bus]); // eslint-disable-line

  /**
   * [Render]
   */
  const styles = {
    base: css({ flex: 1, boxSizing: 'border-box', Flex: 'x-center-center' }),
    pipe: css({ flex: 1 }),
    icon: css({
      marginLeft: iconEdge === 'Right' ? 5 : 0,
      marginRight: iconEdge === 'Left' ? 5 : 0,
      paddingTop: 3,
      opacity: recentlyFired ? 1 : 0.3,
      transition: `opacity 300ms`,
    }),
  };

  // console.log('history.events', history.events);

  const elPipe = (
    <EventPipe
      events={history.events}
      style={styles.pipe}
      theme={'Dark'}
      onEventClick={props.onEventClick}
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
