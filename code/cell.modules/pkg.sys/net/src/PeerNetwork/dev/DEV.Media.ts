import { PeerNetwork } from '..';
import { MediaStreamEvents, slug, t } from './common';

export const Media = {
  videoRef: (self: t.PeerId) => `${self}:video`,
  screenRef: (self: t.PeerId) => `${self}:screen`,

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
      const tx = e.tx || slug();
      const ref = Media.videoRef(args.self);
      const { stream } = await events.media.status(ref).get();
      const media = stream?.media;
      const error = media ? undefined : { message: 'The media stream has not been started' };
      events.net.media(args.self).respond({ tx, media, error });
    });
  },
};
