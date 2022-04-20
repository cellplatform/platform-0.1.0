import React, { useRef } from 'react';

import { Color, css, CssValue } from '../../common';
import { Button } from '../../ui.ref/button/Button';

export type FullScreenProps = { style?: CssValue };

export const FullScreen: React.FC<FullScreenProps> = (props) => {
  const baseRef = useRef<HTMLDivElement>(null);

  /**
   * [Handlers]
   */
  const isFullscreen = () => {
    return document.fullscreenElement === baseRef.current;
  };

  const onEnterFullScreen = async () => {
    await baseRef.current?.requestFullscreen({ navigationUI: 'hide' });
  };

  const onExitFullScreen = async () => {
    if (isFullscreen()) document.exitFullscreen();
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      backgroundColor: Color.format(1),
      Flex: 'center-center',
    }),
    body: css({
      width: 300,
      lineHeight: '2em',
      padding: 20,
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      border: `dashed 1px ${Color.format(-0.1)}`,
      borderRadius: 5,
    }),
  };

  return (
    <div ref={baseRef} {...css(styles.base, props.style)}>
      <div {...styles.body}>
        <Button onClick={onEnterFullScreen} block={true}>
          Enter Full Screen
        </Button>
        <Button onClick={onExitFullScreen} block={true}>
          Exit Full Screen
        </Button>
      </div>
    </div>
  );
};
