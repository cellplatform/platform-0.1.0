import React, { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { EventPipe, EventPipeItemClickEventHandler } from '../../Event.Pipe';
import { css, CssValue, Icons, rx, t } from '../common';

import { Event } from '../../Event';

export type DevEventPipeProps = {
  bus: t.EventBus<any>;
  iconEdge?: 'Left' | 'Right';
  style?: CssValue;
  onEventClick?: EventPipeItemClickEventHandler;
};

export const DevEventPipe: React.FC<DevEventPipeProps> = (props) => {
  const { iconEdge = 'Right' } = props;

  const history = Event.useEventHistory(props.bus);
  const [recentlyFired, setRecentlyFired] = useState(false);
  const changedRef$ = useRef(new Subject<t.EventHistory>());

  /**
   * Lifecycle
   */
  useEffect(() => changedRef$.current.next(history.events), [history.total]); // eslint-disable-line
  useEffect(() => {
    const dispose$ = new Subject<void>();
    const $ = changedRef$.current.pipe(takeUntil(dispose$));
    $.subscribe(() => setRecentlyFired(true));
    $.pipe(debounceTime(1500)).subscribe(() => setRecentlyFired(false));
    return () => rx.done(dispose$);
  }, []); // eslint-disable-line

  /**
   * [Render]
   */
  const styles = {
    base: css({
      flex: 1,
      Flex: 'x-center-center',
      boxSizing: 'border-box',
    }),
    pipe: css({ flex: 1 }),
    icon: css({
      marginLeft: iconEdge === 'Right' ? 5 : 0,
      marginRight: iconEdge === 'Left' ? 5 : 0,
      paddingTop: 3,
      opacity: recentlyFired ? 1 : 0.3,
      transition: `opacity 300ms`,
    }),
  };

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
