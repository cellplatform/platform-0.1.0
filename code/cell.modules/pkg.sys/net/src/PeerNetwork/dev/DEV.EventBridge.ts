import { PeerNetwork } from '..';
import { log, MediaStreamEvents, slug, t } from './common';

export const EventBridge = {
  ref: (self: t.PeerId, kind: t.PeerMediaKind) => `${self}:${kind}`,
  videoRef: (self: t.PeerId) => EventBridge.ref(self, 'video'),
  screenRef: (self: t.PeerId) => EventBridge.ref(self, 'screen'),

  /**
   * Bridges events between the [Media] and [Net] modules.
   * NOTE:
   *    This event connector pattern enables strong de-coupling
   *    between the modules.
   */
  startEventBridge(args: { self: t.PeerId; bus: t.EventBus<any> }) {
    const bus = args.bus.type<t.PeerEvent | t.MediaEvent>();

    const events = {
      net: PeerNetwork.Events({ bus }),
      media: MediaStreamEvents({ bus }),
    };

    /**
     * NETWORK => VIDEO => NETWORK
     */
    events.net.media(args.self).req$.subscribe(async (e) => {
      log.info('EVENT BRIDGE / request:', e);

      const tx = e.tx || slug();
      const ref = EventBridge.ref(e.self, e.kind);

      /**
       * TODO 🐷
       * Start screen share stream when requested.
       */

      const { stream } = await events.media.status(ref).get();
      const media = stream?.media;
      const error = media ? undefined : { message: `The ${e.kind} stream has not been started.` };

      log.info('MEDIA Stream', stream);
      events.net.media(e.self).respond({ tx, media, error });
    });
  },
};
