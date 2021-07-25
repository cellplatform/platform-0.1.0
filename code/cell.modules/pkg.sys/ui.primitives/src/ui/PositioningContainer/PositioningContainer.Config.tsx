import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

export type PositioningContainerConfigProps = { style?: CssValue };

export const PositioningContainerConfig: React.FC<PositioningContainerConfigProps> = (props) => {
  const styles = {
    base: css({
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    }),
  };
  return <div {...css(styles.base, props.style)}>PositioningContainerConfig</div>;
};
