import { useEffect, useState } from 'react';

import { t, FileUtil } from '../common';
import { GroupEvents } from '../event';

/**
 * Manages files sent around the group.
 */
export function useFileList(netbus: t.NetBus<any>) {
  const [list, setList] = useState<t.PeerFile[]>([]);

  useEffect(() => {
    const events = GroupEvents(netbus);
    const files$ = events.fs().files$;

    files$.subscribe((e) => {
      setList((prev) => [...prev, ...e.files]);
    });

    return () => events.dispose();
  }, []); // eslint-disable-line

  return { list };
}
