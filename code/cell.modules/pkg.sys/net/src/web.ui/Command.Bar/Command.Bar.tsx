import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

export type CommandBarProps = {
  network: t.PeerNetwork;
  style?: CssValue;
};

export const CommandBar: React.FC<CommandBarProps> = (props) => {
  const { network } = props;

  /**
   * [Render]
   */
  const styles = { base: css({}) };
  return <div {...css(styles.base, props.style)}>CommandBar</div>;
};
