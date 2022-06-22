import { useEffect, useState } from 'react';
import { RouteEvents } from './Route.Events';
import { DEFAULT } from './common';

import { t, rx } from './common';

export function useRoute(instance: t.RouteInstance) {
  const busid = rx.bus.instance(instance.bus);
  const [url, setUrl] = useState(DEFAULT.DUMMY_URL);

  useEffect(() => {
    const events = RouteEvents({ instance });

    events.current.$.subscribe((e) => setUrl(e.info.url));
    setUrl(events.current.url);

    return () => events.dispose();
  }, [busid, instance.id]); // eslint-disable-line

  /**
   * API.
   */
  const { href, path, query, hash } = url;
  return {
    instance: { bus: busid, id: instance.id },
    href,
    path,
    query,
    hash,
  };
}
