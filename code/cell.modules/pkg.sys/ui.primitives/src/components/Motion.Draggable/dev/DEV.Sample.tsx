import { AnimatePresence, domMax, LazyMotion, m } from 'framer-motion';

import React, { useEffect, useRef, useState } from 'react';
import { style, color, css, CssValue, t } from './common';
import { MotionDraggable, MotionDraggableProps } from '..';

export type SampleProps = {
  draggableProps: MotionDraggableProps;
  style?: CssValue;
};

export const Sample: React.FC<SampleProps> = (props) => {
  const constraintsRef = useRef<HTMLDivElement>(null);

  const styles = {
    base: css({
      Absolute: 0,
      padding: 20,
    }),
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
      Sample
      <LazyMotion features={domMax}>
        <m.div ref={constraintsRef} style={styles.constrantsContainer}>
          <m.div
            drag={true}
            dragElastic={0.3}
            dragMomentum={true}
            dragConstraints={constraintsRef}
            style={styles.draggable}
          />
        </m.div>
      </LazyMotion>
    </div>
  );
};
