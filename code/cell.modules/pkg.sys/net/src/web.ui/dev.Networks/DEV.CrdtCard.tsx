import React, { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CrdtBus } from 'sys.crdt';
import { CrdtDocEvents } from 'sys.crdt/lib/types';

import {
  Button,
  Card,
  CardBody,
  css,
  CssValue,
  ObjectView,
  rx,
  t,
  useEventBusHistory,
} from './DEV.common';

export type DevCrdtCardProps = {
  netbus: t.NetworkBus;
  style?: CssValue;
};

const DEFAULT = {
  DOC: 'myDoc-id',
};

type T = { count: number; msg?: string };

export const DevCrdtCard: React.FC<DevCrdtCardProps> = (props) => {
  const { netbus } = props;
  const history = useEventBusHistory(netbus);

  const [doc, setDoc] = useState<undefined | CrdtDocEvents<T>>();
  const [, setCount] = useState(0);
  const redraw = () => setCount((prev) => prev + 1);

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const dispose$ = new Subject<void>();
    const bus = rx.bus();
    const ctrl = CrdtBus.Controller({ bus, sync: { netbus } });

    const init = async () => {
      const doc = await ctrl.events.doc<T>({ id: DEFAULT.DOC, initial: { count: 0 } });
      setDoc(doc);
      doc.changed$.pipe(takeUntil(dispose$)).subscribe(() => redraw());
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
    footer: css({ fontSize: 14 }),
  };

  const elHeader = (
    <>
      <div>{'CRDT'}</div>
      <div></div>
    </>
  );

  const elBody = (
    <div {...styles.body}>
      <Button onClick={() => doc?.change((d) => d.count++)}>increment</Button>
      <ObjectView name={'Doc'} data={doc?.current || {}} fontSize={11} style={{ marginTop: 20 }} />
    </div>
  );

  const elFooter = (
    <div {...styles.footer}>
      <div>{'Footer'}</div>
    </div>
  );

  return (
    <Card style={css(styles.base, props.style)}>
      <CardBody padding={[18, 20, 15, 20]} header={elHeader} footer={elFooter}>
        {elBody}
      </CardBody>
    </Card>
  );
};
