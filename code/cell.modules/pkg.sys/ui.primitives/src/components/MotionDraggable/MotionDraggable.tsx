import { AnimatePresence, domMax, LazyMotion, m } from 'framer-motion';

import React, { useEffect, useRef, useState } from 'react';
import { style, color, css, CssValue, t } from '../../common';

export type MotionDraggableProps = { style?: CssValue };

export const MotionDraggable: React.FC<MotionDraggableProps> = (props) => {
  const constraintsRef = useRef<HTMLDivElement>(null);

  const styles = {
    base: css({ position: 'relative' }),
    constrantsContainer: {
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      ...style.toAbsolute(80),
    },
    draggable: {
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      borderRadius: 20,
      width: 80,
      height: 80,
    },
  };
  return (
    <div {...css(styles.base, props.style)}>
      <LazyMotion features={domMax}>
        <m.div ref={constraintsRef} style={styles.constrantsContainer}></m.div>
        <m.div drag dragConstraints={constraintsRef} style={styles.draggable} />
      </LazyMotion>
    </div>
  );
};
