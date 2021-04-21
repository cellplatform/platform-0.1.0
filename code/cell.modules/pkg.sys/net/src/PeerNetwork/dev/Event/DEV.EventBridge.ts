import { PeerNetwork } from '../..';
import { log, MediaStream, slug, t } from '../common';

export const EventBridge = {
  ref: (self: t.PeerId, kind: t.PeerConnectionKindMedia) => `${kind}:${self}`,
  videoRef: (self: t.PeerId) => EventBridge.ref(self, 'media/video'),
  screenRef: (self: t.PeerId) => EventBridge.ref(self, 'media/screen'),

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
      media: MediaStream.Events({ bus }),
    };

    /**
     * NETWORK => VIDEO => NETWORK
     */
    events.net.media(args.self).request$.subscribe(async (e) => {
      const { self, kind } = e;
      const tx = e.tx || slug();
      const ref = EventBridge.ref(self, kind);

      const { stream } = await events.media.status(ref).get();
      let media = stream?.media;

      log.info('EVENT BRIDGE / request:', e, ref, media);

      if (!media) {
        if (e.kind === 'media/video') {
          const video = await events.media.start(ref).video();
          media = video.stream;
        }

        if (e.kind === 'media/screen') {
          const screen = await events.media.start(ref).screen();
          media = screen.stream;
        }
      }

      const error = media ? undefined : { message: `The ${kind} stream has not been started.` };
      events.net.media(self).respond({ tx, kind, media, error });
    });
  },
};
