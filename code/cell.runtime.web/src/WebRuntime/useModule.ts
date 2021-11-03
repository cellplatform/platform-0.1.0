import { useEffect, useState } from 'react';
import { t } from '../common';

/**
 * Hook for loading a remote module.
 */
export function useModule<M = any>(runtime: t.RuntimeRemoteWeb): t.RuntimeRemoteModule<M> {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [module, setModule] = useState<M | undefined>();

  useEffect(() => {
    const reset = () => {
      setReady(false);
      setFailed(false);
      setModule(undefined);
    };

    const script = runtime.script();
    script.$.subscribe(async (e) => {
      const isReady = e.payload.ready;
      setReady(isReady);
      setModule(isReady ? await runtime.module() : undefined);
      setFailed(e.payload.failed);
    });

    return () => {
      reset();
      script.dispose();
    };
  }, [runtime.url]); // eslint-disable-line

  return {
    ready,
    failed,
    module,
  };
}
