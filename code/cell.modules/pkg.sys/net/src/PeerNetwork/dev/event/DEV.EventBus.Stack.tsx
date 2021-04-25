import React, { useEffect, useState } from 'react';

import { css, CssValue, EventBusHistory, EventPipe, EventStack } from '../common';

export type DevEventBusStackProps = {
  history: EventBusHistory;
  canBroadcast?: boolean;
  style?: CssValue;
};

export const DevEventBusStack: React.FC<DevEventBusStackProps> = (props) => {
  const { history } = props;

  const styles = {
    base: css({ position: 'relative' }),
    stack: css({ marginTop: 20 }),
    pipe: css({ marginTop: 15, MarginX: 15 }),
  };

  const body = history.total > 0 && (
    <>
      <EventStack
        events={history.events}
        card={{ duration: 150, title: 'Event' }}
        style={styles.stack}
      />
      <EventPipe
        events={history.events}
        style={styles.pipe}
        onEventClick={(e) => {
          console.group('🌳 event');
          console.log('count', e.count);
          console.log('type', e.event.type);
          console.log('payload', e.event.payload);
          console.groupEnd();
        }}
      />
    </>
  );

  return <div {...css(styles.base, props.style)}>{body}</div>;
};
