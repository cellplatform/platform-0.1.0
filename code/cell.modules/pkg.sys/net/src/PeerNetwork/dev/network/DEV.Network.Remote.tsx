import React from 'react';
import { color, css, CssValue, t, TARGET_NAME } from '../common';

import { WebRuntime } from 'sys.runtime.web';

export type DevNetworkRemoteProps = { bus: t.EventBus<any>; style?: CssValue };

export const DevNetworkRemote: React.FC<DevNetworkRemoteProps> = (props) => {
  const { bus } = props;
  const target = TARGET_NAME;
  const remote = WebRuntime.ui.useModuleTarget({ bus, target });

  const Main = remote.module?.default;
  const isActive = Boolean(Main);
  const elMain = isActive && <Main bus={props.bus} />;

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
