import React, { useEffect } from 'react';

import { t, useModule } from '../common';

export type LoaderProps = {
  instance: t.ModuleInstance;
  url?: t.ManifestUrl;
  theme: t.ModuleInfoTheme;
  onLoading?: (e: { ok: boolean; loading: boolean }) => void;
};

export const Loader: React.FC<LoaderProps> = (props) => {
  const { instance, url } = props;
  const bus = instance.bus;
  const remote = useModule({ instance, url });

  useEffect(() => {
    const { ok } = remote;
    const loading = ok ? remote.loading : false;
    props.onLoading?.({ ok, loading });
  }, [remote.loading, remote.ok]); // eslint-disable-line

  const module = remote.module;
  const address = remote.address;

  if (address && typeof module === 'object' && typeof module.default === 'function') {
    const { namespace, entry } = address;
    const url = props.url ?? address.url;
    const ctx: t.ModuleDefaultEntryContext = { bus, source: { url, namespace, entry } };
    const res = remote.module.default(bus, ctx);
    if (React.isValidElement(res)) return res;
  }

  return null;
};
