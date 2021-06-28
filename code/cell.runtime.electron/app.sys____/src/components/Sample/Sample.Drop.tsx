import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';
import { useDragTarget } from 'sys.ui.primitives/lib/hooks/useDragTarget';

export type SampleDropProps = { style?: CssValue };

export const SampleDrop: React.FC<SampleDropProps> = (props) => {
  const styles = {
    base: css({
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    }),
  };
  return <div {...css(styles.base, props.style)}>SampleDrop</div>;
};
