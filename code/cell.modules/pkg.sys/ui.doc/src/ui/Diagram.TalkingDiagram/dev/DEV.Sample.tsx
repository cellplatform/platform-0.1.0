import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, rx } from '../../common';
import { TalkingDiagram } from '..';

export type DevSampleProps = { style?: CssValue };

export const DevSample: React.FC<DevSampleProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      display: 'flex',
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <TalkingDiagram style={{ flex: 1 }} />
    </div>
  );
};
