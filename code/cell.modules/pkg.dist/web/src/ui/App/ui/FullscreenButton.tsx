import React from 'react';

import { Button, COLORS, css, CssValue, Icons, t } from '../common';
import { State } from '../logic';

export type FullscreenButtonProps = {
  instance: t.AppInstance;
  state: t.AppState;
  color?: string | number;
  style?: CssValue;
};

export const FullscreenButton: React.FC<FullscreenButtonProps> = (props) => {
  const { color = COLORS.WHITE } = props;

  const events = State.useEvents(props.instance);
  const isFullscreen = props.state.isFullscreen;

  /**
   * [Render]
   */
  const styles = {
    base: css({ Size: 24 }),
  };

  return (
    <Button style={css(styles.base, props.style)} onClick={() => events.fullscreen(!isFullscreen)}>
      {!isFullscreen && <Icons.Fullscreen.Enter size={24} color={color} />}
      {isFullscreen && <Icons.Fullscreen.Exit size={24} color={color} />}
    </Button>
  );
};
