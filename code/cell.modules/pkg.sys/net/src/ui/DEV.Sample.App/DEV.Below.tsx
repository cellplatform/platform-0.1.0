import React, { useEffect, useState } from 'react';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, EventList, rx, t } from '../common';

export type DevBelowProps = {
  network: t.PeerNetwork;
  siblings: { root: t.DomRect; card: t.DomRect };
  style?: CssValue;
};

export const DevBelow: React.FC<DevBelowProps> = (props) => {
  const { siblings, network } = props;
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
    base: css({
      position: 'relative',
      width: siblings.card.width,
      height: siblings.root.height / 2 - siblings.card.height / 2 - 15,
      Flex: 'x-stretch-stretch',
    }),
    left: css({ flex: 1 }),
    middle: css({ width: 30 }),
    right: css({ width: 300, display: 'flex' }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.left}></div>
      <div {...styles.middle}></div>
      <div {...styles.right}>
        <EventList instance={instance} bus={netbus} style={{ flex: 1 }} />
      </div>
    </div>
  );
};
