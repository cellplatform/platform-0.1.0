import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from './common';

export type DevDialogProps = { style?: CssValue };

export const DevDialog: React.FC<DevDialogProps> = (props) => {
  const styles = {
    base: css({
      flex: 1,
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    }),
  };
  return <div {...css(styles.base, props.style)}>DevDialog</div>;
};
