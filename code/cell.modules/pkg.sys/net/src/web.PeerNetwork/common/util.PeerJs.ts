import { Subject } from 'rxjs';
import { PeerJS } from '../../common';

/**
 * Monitors errors on a PeerJS instance.
 */
export const PeerJsUtil = {
  error(peer: PeerJS.PeerJS) {
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
  },
};
