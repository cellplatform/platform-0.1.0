import React, { useEffect, useRef, useState } from 'react';
import { MinSize, MinSizeResizeEventHandler, color, css, CssValue, t, DEFAULT } from './common';
import { Message } from './components/Message';
import { Shell } from './components/Shell';

export type SlugProjectProps = {
  bus: t.EventBus<any>;
  fs?: t.Fs;
  isEditable?: boolean;
  minWidth?: number;
  minHeight?: number;
  style?: CssValue;
  onResize?: MinSizeResizeEventHandler;
};

export const SlugProject: React.FC<SlugProjectProps> = (props) => {
  const {
    bus,
    fs,
    minWidth = DEFAULT.MIN.WIDTH,
    minHeight = DEFAULT.MIN.HEIGHT,
    isEditable = false,
  } = props;

  const styles = {
    base: css({
      flex: 1,
      position: 'relative',
      backgroundColor: color.format(1),
    }),
    body: css({ Absolute: 0, overflow: 'hidden' }),
    warning: {
      base: css({ flex: 1, Flex: 'center-center' }),
      inner: css({ padding: 40, border: `dashed 2px ${color.format(-0.2)}`, borderRadius: 20 }),
    },
  };

  const elSizeWarning = <Message>Too Small</Message>;
  const elFsWarning = isEditable && !fs && <Message>Filesystem required when editing</Message>;
  const elShell = !elFsWarning && <Shell isEditable={isEditable} bus={bus} />;

  return (
    <div {...css(styles.base, props.style)}>
      <MinSize
        style={styles.body}
        minHeight={minWidth}
        minWidth={minHeight}
        warningElement={elSizeWarning}
        onResize={props.onResize}
      >
        {elShell}
        {elFsWarning}
      </MinSize>
    </div>
  );
};
