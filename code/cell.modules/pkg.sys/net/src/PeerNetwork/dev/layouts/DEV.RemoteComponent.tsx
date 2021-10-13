import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

import { WebRuntime } from '@platform/cell.runtime.web';

export type DevRemoteComponentProps = {
  bus: t.EventBus<any>;
  netbus: t.PeerNetworkBus<any>;
  style?: CssValue;
};

export const DevRemoteComponent: React.FC<DevRemoteComponentProps> = (props) => {
  const [body, setBody] = useState<JSX.Element | undefined>();

  /**
   * Lifecycle
   */
  useEffect(() => {
    const url = 'http://localhost:5000/cell:ckuoq669f000e09l44si3hoja:A1/fs/web/remoteEntry.js';

    const namespace = 'tdb.slc';
    const entry = './Home';

    (async () => {
      const remote = WebRuntime.remote({ url, namespace, entry });
      await remote.script().ready;
      const m = await remote.module();

      console.log('m', m);
      const App = m.default;
      const { bus } = props;

      const el = <App bus={bus} />;

      console.log('el', el);
      setBody(el);
    })();
  }, []); // eslint-disable-line

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

  return <div {...css(styles.base, props.style)}>{body}</div>;
};
