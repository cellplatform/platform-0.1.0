import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

export type EventListProps = { style?: CssValue };

export const EventList: React.FC<EventListProps> = (props) => {
  /**
   * [Render]
   */
  const styles = { base: css({}) };
  return <div {...css(styles.base, props.style)}>EventList</div>;
};
