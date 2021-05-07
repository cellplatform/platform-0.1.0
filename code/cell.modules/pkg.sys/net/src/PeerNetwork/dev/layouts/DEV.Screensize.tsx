import React, { useEffect, useRef, useState } from 'react';
import { COLORS, color, css, CssValue, t } from '../../common';

export type DevScreensizeProps = {
  bus: t.EventBus<any>;
  netbus: t.NetBus<any>;
  style?: CssValue;
};

export const DevScreensize: React.FC<DevScreensizeProps> = (props) => {
  const styles = { base: css({ flex: 1, padding: 30, backgroundColor: COLORS.WHITE }) };
  return (
    <div {...css(styles.base, props.style)}>
      <div>screen size</div>
    </div>
  );
};
