import React, { useEffect } from 'react';

import { t, useModule } from '../common';

export type LoaderProps = {
  instance: t.ModuleInstance;
  url?: t.ManifestUrl;
  onLoading?: (e: { ok: boolean; loading: boolean }) => void;
};

export const Loader: React.FC<LoaderProps> = (props) => {
  const { instance, url } = props;
  const remote = useModule({ instance, url });
  const Component = remote.module?.default;

  useEffect(() => {
    const { ok } = remote;
    const loading = ok ? remote.loading : false;
    props.onLoading?.({ ok, loading });
  }, [remote.loading, remote.ok]); // eslint-disable-line

  return Component ? <Component bus={instance.bus} /> : null;
};
