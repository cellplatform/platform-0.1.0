import React, { useState } from 'react';

import { useLocalPeer } from '../../hooks';
import {
  UAParser,
  Button,
  color,
  COLORS,
  css,
  CssValue,
  Hr,
  Icons,
  isLocalhost,
  PeerNetwork,
  PropList,
  PropListItem,
  t,
  Textbox,
} from '../common';
import { DevVideo } from '../media';
import { openHandler, PropUtil } from './util';

export type DevDataConnectionProps = {
  bus: t.EventBus<any>;
  netbus: t.PeerNetworkBus<any>;
  connection: t.PeerConnectionDataStatus;
  style?: CssValue;
};

export const DevDataConnection: React.FC<DevDataConnectionProps> = (props) => {
  const { connection, bus, netbus } = props;
  const self = netbus.self;
  const local = useLocalPeer({ self, bus });

  const children = local.connections.filter((conn) => conn.parent === connection.id);
  const childMedia = children
    .filter(({ kind }) => kind === 'media/video' || kind === 'media/screen')
    .map((child) => child as t.PeerConnectionMediaStatus);
  const childVideo = childMedia.filter((child) => child.kind === 'media/video');
  const childScreen = childMedia.filter((child) => child.kind === 'media/screen');

  const mediaHandler = (kind: t.PeerConnectionKindMedia) => {
    const open = openHandler({ bus, connection, kind });
    return async () => {
      const media = childMedia.filter((item) => item.kind === kind);
      if (media.length === 0) open();
      if (media.length > 0) {
        const events = PeerNetwork.PeerEvents(bus);
        await Promise.all(
          media.map((item) => events.connection(self, item.peer.remote.id).close(item.id)),
        );
        events.dispose();
      }
    };
  };

  // Derive the remote user-agent device details.
  const device: PropListItem | undefined = (() => {
    const text = connection.peer.remote.userAgent;
    if (!text) return undefined;

    const device = UAParser(text);
    return {
      label: 'device',
      value: {
        data: `${device.os.name} / ${device.browser.name}`,
        clipboard: text,
      },
    };
  })();

  const mainItems: (PropListItem | undefined)[] = [
    ...PropUtil.common(connection),
    device,
    {
      label: 'media/video',
      value: (
        <Button
          label={childVideo.length === 0 ? 'Start Video' : 'Stop Video'}
          onClick={mediaHandler('media/video')}
        />
      ),
    },
    {
      label: 'media/screen',
      value: (
        <Button
          label={childScreen.length === 0 ? 'Share Screen' : 'Stop Screen'}
          onClick={mediaHandler('media/screen')}
        />
      ),
    },
  ];

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      padding: 12,
      paddingRight: 18,
    }),
    body: {
      base: css({ position: 'relative' }),
      buttons: css({
        Flex: 'horizontal-center-spaceBetween',
        fontSize: 12,
        marginTop: 15,
      }),
      textbox: css({ MarginX: 20, fontSize: 12 }),
      events: {
        stack: css({ marginTop: 20 }),
        pipe: css({ marginTop: 15, MarginX: 15 }),
      },
    },
    drag: {
      overlay: css({ Absolute: 0, Flex: 'vertical-center-center' }),
      icon: css({ marginBottom: 6, opacity: 0.2 }),
    },
    textbox: css({ MarginX: 20, fontSize: 12, marginBottom: 10 }),
    video: css({ Flex: 'vertical-center-center' }),
  };

  const [connectId, setConnectId] = useState<string>('');
  const elConnect = (
    <Textbox
      value={connectId}
      placeholder={'new connection on remote peer'}
      onChange={(e) => setConnectId(e.to)}
      style={styles.textbox}
      spellCheck={false}
      selectOnFocus={true}
      enter={{
        async handler() {
          const remote = connectId.trim();
          if (!remote) return;

          /**
           * TODO 🐷
           * clear up param names.
           */

          const group = PeerNetwork.GroupEvents(netbus);
          const id = connection.peer.remote.id;
          group.connect().fire(id, remote, 'data');
          group.dispose();

          const isConnectedLocally = local.connections
            .filter((child) => child.kind === 'data')
            .some((child) => child.peer.remote.id === remote);

          if (!isConnectedLocally) {
            const events = PeerNetwork.PeerEvents(bus);
            await events.connection(self, remote).open.data();
            events.dispose();
          }
        },
        icon: (e) => {
          const msg = connectId.trim();
          const col = msg ? COLORS.BLUE : color.alpha(COLORS.DARK, 0.3);
          const el = <Icons.Antenna size={16} color={col} />;
          return el;
        },
      }}
    />
  );

  const elMedia = childMedia
    .map((child) => {
      if (child.kind === 'media/screen' && child.direction === 'outgoing') return;
      return (
        <div {...styles.video} key={child.uri}>
          <DevVideo
            kind={child.kind}
            stream={child.media}
            isVideoMuted={isLocalhost ? true : false}
            bus={bus}
          />
        </div>
      );
    })
    .filter(Boolean);

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body.base}>
        <PropList title={'Data Connection'} items={mainItems} defaults={{ clipboard: false }} />
        {elMedia.length > 0 && <Hr thickness={5} opacity={0.1} margin={[10, 0]} />}
        {elMedia}
        <Hr thickness={5} opacity={0.1} margin={[10, 0, 20, 0]} />
        {elConnect}
      </div>
    </div>
  );
};
