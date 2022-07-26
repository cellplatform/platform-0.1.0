import React, { useEffect, useState } from 'react';

import { DEFAULT, rx, t, useModule } from '../common';

export type LoaderProps = {
  instance: t.ModuleInstance;
  url?: t.ManifestUrl;
  theme: t.ModuleInfoTheme;
  debug?: t.ModuleDebug;
  onLoading?: (e: { ok: boolean; loading: boolean }) => void;
};

export const Loader: React.FC<LoaderProps> = (props) => {
  const { instance, url, debug = DEFAULT.DEBUG } = props;
  const bus = instance.bus;
  const busid = rx.bus.instance(bus);

  const remote = useModule({ instance, url, log: debug.logLoader });
  const [element, setElement] = useState<JSX.Element | null>(null);

  /**
   * Manage loading status.
   */
  useEffect(() => {
    const { ok } = remote;
    const loading = ok ? remote.loading : false;
    props.onLoading?.({ ok, loading });
  }, [remote.loading, remote.ok, busid, instance.id]); // eslint-disable-line

  /**
   * Manage the "default" entry function execution
   * when the remote module completes it's load
   */
  useEffect(() => {
    remote.renderDefaultEntry(bus).then((el) => setElement(el));
  }, [remote.loading, remote.ok, remote.addressKey, busid, instance.id]); // eslint-disable-line

  return element;
};
