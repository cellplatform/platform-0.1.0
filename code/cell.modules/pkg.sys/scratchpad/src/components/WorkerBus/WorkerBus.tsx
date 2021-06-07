import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

export type WorkerBusProps = { style?: CssValue };

export const WorkerBus: React.FC<WorkerBusProps> = (props) => {
  const styles = {
    base: css({
      flex: 1,
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    }),
  };
  return <div {...css(styles.base, props.style)}>WorkerBus</div>;
};
