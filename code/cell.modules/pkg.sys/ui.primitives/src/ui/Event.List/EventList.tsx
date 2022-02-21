import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

export type EventListProps = {
  items?: t.EventHistoryItem[];
  style?: CssValue;
};

export const EventList: React.FC<EventListProps> = (props) => {
  const { items = [] } = props;

  /**
   * [Render]
   */
  const styles = { base: css({}) };
  return <div {...css(styles.base, props.style)}>EventList</div>;
};
