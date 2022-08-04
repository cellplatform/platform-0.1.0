import React, { useEffect, useState } from 'react';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, EventList, rx, t } from './common';
import { DevLayoutVertical } from './DEV.Layout.Vertical';

export type DevEventLogProps = {
  network: t.PeerNetwork;
  sizes: { root: t.DomRect; card: t.DomRect };
  style?: CssValue;
};

export const DevEventLog: React.FC<DevEventLogProps> = (props) => {
  const { sizes, network } = props;
  const { bus, netbus } = network;

  const instance = { bus, id: rx.bus.instance(bus) };
  const busid = rx.bus.instance(netbus);

  const [, setCount] = useState(0);
  const redraw = () => setCount((prev) => prev + 1);

  /**
   * HACK
   * Force redraw when fired
   */
  useEffect(() => {
    const { dispose, dispose$ } = rx.disposable();
    netbus.$.pipe(takeUntil(dispose$)).subscribe(redraw);
    return dispose;
  }, [instance.id, busid]); // eslint-disable-line

  /**
   * [Render]
   */
  const styles = {
    base: css({ Absolute: 0, pointerEvents: 'none' }),
    body: css({ Absolute: [10, 0, 0, 0], boxSizing: 'border-box', Flex: 'x-stretch-stretch' }),
    left: css({ flex: 1 }),
    middle: css({ width: 30 }),
    right: css({ position: 'relative', width: 300, display: 'flex' }),
    log: css({ Absolute: [0, 0, 0, 20], pointerEvents: 'auto' }),
  };

  const elBody = (
    <div {...styles.body}>
      <div {...styles.left}></div>
      <div {...styles.middle}></div>
      <div {...styles.right}>
        <EventList instance={instance} bus={netbus} empty={''} style={styles.log} />
      </div>
    </div>
  );

  return <DevLayoutVertical sizes={sizes} below={elBody} style={css(styles.base, props.style)} />;
};
