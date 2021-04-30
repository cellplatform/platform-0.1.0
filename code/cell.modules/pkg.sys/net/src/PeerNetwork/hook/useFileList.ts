import { useEffect, useState } from 'react';

import { t, FileUtil } from '../common';
import { FilesystemEvents } from '../event';

type T = { file: t.PeerFile; uri: string };

/**
 * Manages files sent around the group.
 */
export function useFileList(netbus: t.NetBus<any>) {
  const [list, setList] = useState<T[]>([]);

  useEffect(() => {
    const events = FilesystemEvents(netbus);
    const files$ = events.add().$;

    files$.subscribe(async (e) => {
      const items: T[] = await Promise.all(
        e.files.map(async (file) => {
          const uri = await FileUtil.toUri(file.blob);
          return { file, uri };
        }),
      );

      setList((prev) => [...prev, ...items]);
    });

    return () => events.dispose();
  }, []); // eslint-disable-line

  return { list };
}
