import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { Connection } from '..';
import * as types from '../types';
import { Card, css, CssValue, PropList, PropListItem, rx, t } from './common';
import { DevObject } from './DEV.Object';

export type DevConnectionProps = {
  bus: t.EventBus<any>;
  docs: t.Docs;
  style?: CssValue;
};

export const DevConnection: React.FC<DevConnectionProps> = (props) => {
  const { docs } = props;
  const bus = props.bus as t.EventBus<t.CrdtEvent>;

  const [count, setCount] = useState<number>(0);
  const redraw = () => setCount((prev) => prev + 1);

  const [connection, setConnection] = useState<types.CrdtConnection>();
  const [isEnabled, setEnabled] = useState<boolean>(true);

  useEffect(() => {
    setConnection(Connection({ bus, docs }));

    const dispose$ = new Subject<void>();
    const $ = bus.$.pipe(takeUntil(dispose$));

    rx.payload<types.CrdtBroadcastChangeEvent>($, 'CRDT/broadcast/change')
      .pipe(debounceTime(100))
      .subscribe(redraw);
    return () => dispose$.next();
  }, []); // eslint-disable-line

  useEffect(() => {
    if (connection) connection.isEnabled = isEnabled;
  }, [connection, isEnabled]);

  const SPACING = { CARD: 10 };
  const styles = {
    base: css({
      flex: 1,
      Flex: 'vertical-stretch-stretch',
      boxSizing: 'border-box',
      position: 'relative',
    }),
    header: {
      base: css({ marginBottom: 10 }),
    },
    body: {
      base: css({ flex: 1, position: 'relative' }),
      items: css({}),
    },
    object: css({ display: 'inline-block' }),
  };

  const ids = Array.from(props.docs.docIds);
  const elObjects = ids.map((id, index) => {
    return (
      <DevObject
        key={index}
        bus={bus}
        id={id}
        docs={docs}
        margin={[0, SPACING.CARD, SPACING.CARD, 0]}
        style={styles.object}
      />
    );
  });

  const items: PropListItem[] = [
    { label: 'id', value: connection?.id },
    {
      label: `enabled (${isEnabled ? 'online' : 'offline'})`,
      value: {
        data: isEnabled,
        kind: 'Switch',
        onClick: (e) => setEnabled((prev) => !prev),
      },
    },
  ];

  return (
    <div {...css(styles.base, props.style)}>
      <Card padding={[15, 15, 5, 15]}>
        <div {...styles.body.base}>
          <div {...styles.header.base}>
            <PropList title={'Connection'} items={items} />
          </div>
          <div {...styles.body.items}>{elObjects}</div>
        </div>
      </Card>
    </div>
  );
};
