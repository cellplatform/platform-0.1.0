import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, Vimeo, useDragTarget } from '../common';
import { Message } from './Message';

export type ShellVideoProps = {
  bus: t.EventBus<any>;
  height: number;
  isEditable: boolean;
  style?: CssValue;
};

export const ShellVideo: React.FC<ShellVideoProps> = (props) => {
  const { bus, height, isEditable } = props;
  const drag = useDragTarget<HTMLDivElement>();

  const video = 598757457;

  const styles = {
    base: css({ position: 'relative', overflow: 'hidden', height }),
    video: css({ pointerEvents: 'none' }),
    dropOverlay: css({ Absolute: 0 }),
  };

  const elDropOverlay = isEditable && drag.isDragOver && (
    <Message style={styles.dropOverlay}>Drop</Message>
  );

  return (
    <div ref={drag.ref} {...css(styles.base, props.style)}>
      <Vimeo
        bus={bus}
        id={'instance'}
        video={video}
        height={height}
        scale={1.1}
        style={styles.video}
      />
      {elDropOverlay}
    </div>
  );
};
