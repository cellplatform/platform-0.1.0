import Automerge from 'automerge';
import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DevConnection } from '../../../NetworkModel__/Crdt.OLD/dev/DEV.Connection';
import { useLocalPeer } from '../../hooks';
import { Button, COLORS, css, CssValue, t } from '../common';

export type DevCrdtModelProps = {
  bus: t.EventBus<any>;
  netbus: t.PeerNetworkBus<any>;
  style?: CssValue;
};

export const DevCrdtModel: React.FC<DevCrdtModelProps> = (props) => {
  const { netbus } = props;
  const bus = props.bus as t.EventBus<t.DevEvent>;
  const peer = useLocalPeer({ self: netbus.self, bus });
  // console.log('peer.status', peer.status);

  const [count, setCount] = useState<number>(0);
  const redraw = () => setCount((prev) => prev + 1);

  const [docs, setDocs] = useState<Automerge.DocSet<any>>(new Automerge.DocSet());
  // const [connection, setConnection] = useState<CrdtConnection>();

  useEffect(() => {
    const dispose$ = new Subject<void>();
    const $ = netbus.$.pipe(takeUntil(dispose$));

    $.subscribe((e) => {
      console.log('e', e);
    });

    return () => dispose$.next();
  }, []); // eslint-disable-line

  const styles = {
    base: css({ flex: 1, padding: 30, backgroundColor: COLORS.WHITE }),
    toolbar: css({ marginTop: 30 }),
    body: {
      base: css({ Flex: 'horizontal-stretch-stretch' }),
      left: css({ flex: 1 }),
      middle: css({ flex: 1 }),
      right: css({ flex: 1 }),
    },
  };
  return (
    <div {...styles.base}>
      <div>Distributed Network State Model (CRDT)</div>
      <div {...styles.toolbar}>
        <Button
          label={'create'}
          margin={[null, 10, null, null]}
          onClick={() => {
            docs.setDoc('doc1', Automerge.from({ count: 0 }));
            redraw();
          }}
        />
        <Button label={'redraw'} onClick={redraw} />
      </div>
      <div {...styles.body.base}>
        <div {...styles.body.left}>
          <DevConnection bus={netbus} docs={docs} style={{ maxWidth: 400, marginTop: 20 }} />
        </div>
        <div {...styles.body.middle}></div>
        <div {...styles.body.right}>
          {/* <DevEventBus bus={netbus} style={{ width: 350 }} /> */}
        </div>
      </div>
    </div>
  );
};
