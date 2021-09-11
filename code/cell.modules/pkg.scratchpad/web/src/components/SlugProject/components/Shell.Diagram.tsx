import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, useDragTarget } from '../common';

import { Message } from './Message';

export type ShellDiagramProps = {
  bus: t.EventBus<any>;
  isEditable: boolean;
  style?: CssValue;
};

export const ShellDiagram: React.FC<ShellDiagramProps> = (props) => {
  const { isEditable } = props;

  const drag = useDragTarget<HTMLDivElement>();

  const styles = {
    base: css({
      position: 'relative',
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    }),
    dropOverlay: css({ Absolute: 0 }),
  };

  const elDropOverlay = isEditable && drag.isDragOver && (
    <Message style={styles.dropOverlay}>Drop</Message>
  );

  return (
    <div ref={drag.ref} {...css(styles.base, props.style)}>
      ShellDiagram
      {elDropOverlay}
    </div>
  );
};
