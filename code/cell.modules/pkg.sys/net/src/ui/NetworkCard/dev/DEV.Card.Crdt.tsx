import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CrdtBus } from 'sys.data.crdt';
import { CrdtDocEvents } from 'sys.data.crdt/lib/types';

import { Button, Card, CardBody, css, CssValue, ObjectView, t } from './DEV.common';

export type DevCrdtCardProps = {
  instance: { network: t.PeerNetwork; id: t.Id };
  style?: CssValue;
};

const DEFAULT = {
  DOC: 'myDoc',
};

type T = { count: number; msg?: string };

export const DevCrdtCard: React.FC<DevCrdtCardProps> = (props) => {
  const { network } = props.instance;
  const { bus, netbus } = network;

  const [doc, setDoc] = useState<undefined | CrdtDocEvents<T>>();
  const [obj, setObj] = useState<undefined | T>();

  const [, setCount] = useState(0);
  const redraw = () => setCount((prev) => prev + 1);
  const increment = () => doc?.change((d) => d.count++);

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const dispose$ = new Subject<void>();

    const ctrl = CrdtBus.Controller({
      bus,
      id: network.netbus.self,
      sync: { netbus, debounce: 300 },
    });

    const init = async () => {
      console.log('-------------------------------------------');
      const initial: T = { count: 0 };
      const doc = await ctrl.events.doc<T>({ id: DEFAULT.DOC, initial });

      setDoc(doc);
      setObj(doc.current);

      doc.changed$.pipe(takeUntil(dispose$)).subscribe((e) => {
        const local = netbus.self;
        console.log('CHANGED', local, e.doc.next);
        // console.group('🌳 CHANGED - self', network.netbus.self);
      });
    };

    init();
    return () => dispose$.next();
  }, []); // eslint-disable-line

  /**
   * [Render]
   */
  const styles = {
    base: css({ width: 300, display: 'flex' }),
    body: css({ minHeight: 50, fontSize: 14 }),
    footer: css({ fontSize: 12 }),
  };

  const elHeader = (
    <>
      <div>{'CRDT'}</div>
      <div></div>
    </>
  );

  const elBody = (
    <div {...styles.body}>
      <Button onClick={increment}>increment</Button>
      <ObjectView name={'doc'} data={doc?.current || {}} fontSize={11} style={{ marginTop: 20 }} />
    </div>
  );

  const elFooter = (
    <div {...styles.footer}>
      <div>{'Footer'}</div>
    </div>
  );

  return (
    <Card style={css(styles.base, props.style)}>
      <CardBody padding={[18, 20, 15, 20]} header={{ el: elHeader }} footer={{ el: elFooter }}>
        {elBody}
      </CardBody>
    </Card>
  );
};
