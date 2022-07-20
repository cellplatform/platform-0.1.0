import React from 'react';
import { color, css, CssValue, t, TARGET_NAME, WebRuntime } from '../DEV.common';

export type DevNetworkRemoteProps = { bus: t.EventBus<any>; style?: CssValue };

export const DevNetworkRemote: React.FC<DevNetworkRemoteProps> = (props) => {
  const { bus } = props;
  const instance = { bus };

  const target = TARGET_NAME;
  const remote = WebRuntime.UI.useModuleTarget({ instance, target });

  const Main = remote.module?.default;
  const isActive = Boolean(Main);
  const elMain = isActive && <Main bus={bus} />;

  if (!elMain) return null;

  /**
   * Render
   */
  const styles = {
    base: css({
      Absolute: 0,
      backgroundColor: color.format(1),
      pointerEvents: isActive ? 'auto' : 'none',
    }),
  };

  return <div {...css(styles.base, props.style)}>{elMain}</div>;
};
