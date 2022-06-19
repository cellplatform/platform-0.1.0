import React from 'react';

import { COLORS, css, Icons, t, time } from '../common';
import * as k from './types';

export const toItems = (
  status: t.PeerStatus | undefined,
  fields: k.LocalPeerCardFields[],
): t.PropListItem[] => {
  if (!status) return [];

  const signal = status.signal;
  const elapsed = time.elapsed(status.createdAt || -1);
  const lifetime = elapsed.sec < 60 ? 'less than a minute' : elapsed.toString();

  const items: t.PropListItem[] = [];
  const push = (...input: t.PropListItem[]) => items.push(...input);

  fields.forEach((field) => {
    if (field === 'PeerId') {
      push({
        label: 'local peer',
        value: { data: status.id, clipboard: true },
      });
    }

    if (field === 'SignalServer') {
      const styles = {
        base: css({ Flex: 'horizontal-center-center' }),
        icon: css({ marginRight: 3 }),
      };
      const lock = { size: 14, color: COLORS.DARK, style: styles.icon };
      push({
        label: `signal server`,
        value: (
          <div {...styles.base}>
            {signal.secure ? <Icons.Lock.Closed {...lock} /> : <Icons.Lock.No {...lock} />}
            {signal.host}:{signal.port}
          </div>
        ),
      });
    }

    if (field === 'Lifetime') {
      push({
        label: 'lifetime',
        value: status.isOnline ? lifetime : 'no',
      });
    }

    if (field === 'Connections.Count') {
      push({
        label: `connections`,
        value: status.connections.length,
      });
    }
  });

  return items;
};
