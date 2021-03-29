import { Subject } from 'rxjs';
import { PeerJS, t } from '../../common';

type C = t.PeerConnectionStatus;

/**
 * Common filtering methods.
 */
export const Filter = {
  connectionsAs<T extends C>(connections: C[], kind: C['kind']) {
    return connections.filter((item) => item.kind === kind).map((item) => item as T);
  },
};

/**
 * Monitors errors on a PeerJS instance.
 */
export const PeerJSError = (peer: PeerJS) => {
  const $ = new Subject<{ type: string; message: string }>();

  const handler = (error: any) => {
    const { type, message } = error;
    $.next({ type, message });
  };

  peer.on('error', handler);

  return {
    $: $.asObservable(),
    dispose() {
      peer.off('error', handler);
      $.complete();
    },
  };
};
