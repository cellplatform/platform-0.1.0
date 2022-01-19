import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

export type ConnectorsProps = { style?: CssValue };

export const Connectors: React.FC<ConnectorsProps> = (props) => {
  const styles = {
    base: css({
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    }),
  };
  return <div {...css(styles.base, props.style)}>DataCardConnectors</div>;
};
