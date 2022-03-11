import React from 'react';
import { css, CssValue, t, EventListConstants } from './common';
import { CountLabel } from './components/Label.Count';
import { TypeLabel } from './components/Label.Type';

const { ROW } = EventListConstants;
type D = t.EventHistoryItem;

export type EventListRowProps = {
  index: number;
  data: D;
  is: { first: boolean; last: boolean; selected?: boolean };
  style?: CssValue;
  onClick?: (e: { index: number; data: D }) => void;
};

export const EventListRow: React.FC<EventListRowProps> = (props) => {
  const { index, data, is, onClick } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      boxSizing: 'border-box',
      paddingLeft: 6,
      paddingRight: 15,
      Flex: 'x-stretch-stretch',
      fontSize: 12,
      height: ROW.HEIGHT,
    }),
    left: css({
      flex: 1,
      opacity: is.selected === undefined || is.selected === true ? 1 : 0.4,
    }),
    right: css({}),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <TypeLabel
        text={data.event.type}
        style={styles.left}
        monochrome={is.selected === false}
        onClick={(e) => onClick?.({ index, data })}
      />
      <CountLabel count={data.count} style={styles.right} />
    </div>
  );
};
