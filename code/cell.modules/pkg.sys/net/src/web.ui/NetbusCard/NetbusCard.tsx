import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, Card } from '../common';

export type NetbusCardProps = {
  netbus: t.PeerNetbus<any>;
  showAsCard?: boolean;
  padding?: t.CssEdgesInput;
  margin?: t.CssEdgesInput;
  style?: CssValue;
};

export const NetbusCard: React.FC<NetbusCardProps> = (props) => {
  const { showAsCard = true, padding = [18, 20, 15, 20] } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      minWidth: 300,
    }),
  };
  return (
    <Card style={css(styles.base, props.style)} padding={padding} showAsCard={showAsCard}>
      <div>NetbusCard</div>
    </Card>
  );
};
