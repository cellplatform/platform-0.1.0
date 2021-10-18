import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

import { WebRuntime } from '@platform/cell.runtime.web';

export type DevRemoteComponentProps = {
  bus: t.EventBus<any>;
  netbus: t.PeerNetworkBus<any>;
  remote?: { url: string; namespace: string; entry: string };
  style?: CssValue;
};

export const DevRemoteComponent: React.FC<DevRemoteComponentProps> = (props) => {
  const { remote } = props;

  const { url, namespace, entry } = (() => {
    if (!remote) {
      /**
       * TODO 🐷 TEMP
       */
      const url = 'http://localhost:5000/cell:ckuoq669f000e09l44si3hoja:A1/fs/web/remoteEntry.js';
      const namespace = 'tdb.slc';
      const entry = './Home';
      return { url, namespace, entry };
    } else {
      const url = remote?.url ?? '';
      const namespace = remote?.namespace ?? '';
      const entry = remote?.entry ?? '';
      return { url, namespace, entry };
    }
  })();

  const { module } = WebRuntime.remote({ url, namespace, entry }).useModule();

  console.group('🌳 ');
  console.log('remote', remote);
  console.log('url', url);
  console.log('namespace', namespace);
  console.log('entry', entry);
  console.groupEnd();

  const App = module?.default;
  const elMain = App && <App bus={props.bus} />;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      flex: 1,
      position: 'relative',
      backgroundColor: color.format(1),
    }),
    empty: css({
      Absolute: 0,
      Flex: 'center-center',
      fontSize: 12,
      fontStyle: 'italic',
      color: color.format(0.4),
    }),
  };

  const elEmpty = !elMain && <div {...styles.empty}>Nothing to display</div>;

  return (
    <div {...css(styles.base, props.style)}>
      {elMain}
      {elEmpty}
    </div>
  );
};
