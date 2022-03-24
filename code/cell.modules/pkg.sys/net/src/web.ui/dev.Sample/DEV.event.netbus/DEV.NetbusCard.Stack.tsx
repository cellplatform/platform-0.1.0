import React from 'react';

import { css, CssValue, EventPipe, EventStack, t } from '../DEV.common';

export type DevEventBusStackProps = {
  history: t.EventHistory;
  style?: CssValue;
};

export const DevEventBusStack: React.FC<DevEventBusStackProps> = (props) => {
  const { history } = props;

  const styles = {
    base: css({ position: 'relative' }),
    stack: css({ marginTop: 20 }),
    pipe: css({ marginTop: 15, MarginX: 15 }),
  };

  const body = history.length > 0 && (
    <>
      <EventStack
        events={history}
        card={{ duration: 150, title: 'Distributed Event' }}
        style={styles.stack}
      />
      <EventPipe
        events={history}
        style={styles.pipe}
        onEventClick={(item) => {
          console.log('event', item.event);
        }}
      />
    </>
  );

  return <div {...css(styles.base, props.style)}>{body}</div>;
};
