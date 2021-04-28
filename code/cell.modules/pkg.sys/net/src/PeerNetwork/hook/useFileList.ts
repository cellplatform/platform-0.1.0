import { useEffect, useState } from 'react';

import { t, toDataUri } from '../common';
import { GroupEvents } from '../event';

type F = { dir: string; filename: string; uri: string };

/**
 * Manages files sent around the group.
 */
export function useFileList(netbus: t.NetBus<any>) {
  const [list, setList] = useState<F[]>([]);

  useEffect(() => {
    const events = GroupEvents(netbus);
    const files$ = events.fs().files$;

    files$.subscribe((e) => {
      const { dir } = e;

      const list: F[] = e.files
        .filter((e) => e.mimetype)
        .map(({ filename, data, mimetype = '' }) => {
          return { dir, filename, uri: toDataUri(data, mimetype) };
        });

      setList((prev) => [...prev, ...list]);
    });

    return () => events.dispose();
  }, []); // eslint-disable-line

  return { list };
}
