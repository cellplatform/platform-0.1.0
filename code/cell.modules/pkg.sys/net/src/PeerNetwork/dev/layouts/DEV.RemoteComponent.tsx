import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

import { WebRuntime } from '@platform/cell.runtime.web';

export type DevRemoteComponentProps = {
  bus: t.EventBus<any>;
  netbus: t.PeerNetworkBus<any>;
  style?: CssValue;
};

export const DevRemoteComponent: React.FC<DevRemoteComponentProps> = (props) => {
  const url = 'http://localhost:5000/cell:ckuoq669f000e09l44si3hoja:A1/fs/web/remoteEntry.js';
  const namespace = 'tdb.slc';
  const entry = './Home';
  const { module } = WebRuntime.remote({ url, namespace, entry }).useModule();

  const App = module?.App;
  const el = App && <App bus={props.bus} />;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      flex: 1,
      position: 'relative',
      backgroundColor: color.format(1),
    }),
  };

  return <div {...css(styles.base, props.style)}>{el}</div>;
};
