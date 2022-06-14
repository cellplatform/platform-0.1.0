import React, { useEffect, useRef, useState } from 'react';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, rx, t } from './common';
import { DevVideos } from './DEV.Videos';

export type DevTrayProps = {
  instance: { network: t.PeerNetwork; id: t.Id };
  style?: CssValue;
};

export const DevTray: React.FC<DevTrayProps> = (props) => {
  const { instance } = props;
  const network = instance.network;

  const [total, setTotal] = useState(0);

  useEffect(() => {
    const { dispose, dispose$ } = rx.disposable();
    const status$ = network.status.$.pipe(takeUntil(dispose$));
    status$.subscribe((e) => setTotal(e.connections.length));
    return dispose;
  }, []); // eslint-disable-line

  if (total === 0) return null;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      boxSizing: 'border-box',
      position: 'relative',
      PaddingX: 8,
      Flex: 'x-center-center',
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <DevVideos instance={props.instance} video={{ width: 22, height: 22, radius: 3 }} />
    </div>
  );
};
