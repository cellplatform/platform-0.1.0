import React from 'react';
import { css, CssValue, t, EventListConstants } from './common';
import { CountLabel } from './Label.Count';
import { TypeLabel } from './Label.Type';

const { ROW } = EventListConstants;

export type EventListRowProps = {
  index: number;
  data: t.EventHistoryItem;
  is: { first: boolean; last: boolean };
  style?: CssValue;
};

export const EventListRow: React.FC<EventListRowProps> = (props) => {
  const { data } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Flex: 'x-stretch-stretch',
      fontSize: 12,
      boxSizing: 'border-box',
      paddingLeft: 6,
      paddingRight: 15,
      height: ROW.HEIGHT,
    }),
    left: css({ flex: 1 }),
    right: css({}),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <TypeLabel text={data.event.type} style={styles.left} />
      <CountLabel count={data.count} style={styles.right} />
    </div>
  );
};
