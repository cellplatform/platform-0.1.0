import React from 'react';
import { css, CssValue } from '../../common';

export type DevEventListProps = { style?: CssValue };

export const DevEventList: React.FC<DevEventListProps> = (props) => {
  const styles = { base: css({}) };
  return <div {...css(styles.base, props.style)}>DevEventList</div>;
};
