import { Observable, Subject, BehaviorSubject } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
  tap,
} from 'rxjs/operators';
import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, COLORS, Button } from '../common';
import { DevModal } from '../layouts';
import { useLocalPeer } from '../../hook';

import { Connection, CrdtConnection } from '../../../NetworkModel/Crdt.OLD';
import { DevConnection } from '../../../NetworkModel/Crdt.OLD/dev/DEV.Connection';
import Automerge from 'automerge';

export type DevCrdtModelProps = {
  bus: t.EventBus<any>;
  netbus: t.PeerBus<any>;
  style?: CssValue;
};

export const DevCrdtModel: React.FC<DevCrdtModelProps> = (props) => {
  const { netbus } = props;
  const bus = props.bus.type<t.DevEvent>();
  const peer = useLocalPeer({ self: netbus.self, bus });
  // console.log('peer.status', peer.status);

  const [count, setCount] = useState<number>(0);
  const redraw = () => setCount((prev) => prev + 1);

  const [docs, setDocs] = useState<Automerge.DocSet<any>>(new Automerge.DocSet());
  // const [connection, setConnection] = useState<CrdtConnection>();

  useEffect(() => {
    const dispose$ = new Subject<void>();
    const $ = netbus.event$.pipe(takeUntil(dispose$));

    $.subscribe((e) => {
      console.log('e', e);
    });

    return () => dispose$.next();
  }, []); // eslint-disable-line

  const styles = {
    base: css({
      flex: 1,
      padding: 30,
      backgroundColor: COLORS.WHITE,
    }),
    toolbar: css({
      marginTop: 30,
    }),
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
