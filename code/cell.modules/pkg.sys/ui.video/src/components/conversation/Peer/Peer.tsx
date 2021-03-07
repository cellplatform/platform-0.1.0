import React, { useEffect, useRef, useState } from 'react';

import { Icons } from '../../Icons';
import { Button } from '../../Primitives';
import { color, css, CssValue, defaultValue, PeerJS, t } from '../common';
import { PeerLabel } from './Peer.Label';

export type PeerProps = {
  bus: t.EventBus<any>;
  model?: t.ConversationState;
  peer: PeerJS;
  id?: string;
  isSelf?: boolean;
  isMuted?: boolean;
  isCircle?: boolean;
  isCircleTransition?: number;
  width?: number;
  height?: number;
  autoPlay?: boolean;
  style?: CssValue;
};

export const Peer: React.FC<PeerProps> = (props) => {
  const { isSelf, peer, isCircle, model } = props;
  const bus = props.bus.type<t.ConversationEvent>();
  const autoPlay = defaultValue(props.autoPlay, true);

  const height = props.height || 200;
  let width = props.width || 300;
  width = isCircle ? height : width;

  const host = location.hostname;
  const [isMuted, setIsMuted] = useState<boolean>(props.isMuted || host === 'localhost'); // NB: Peers muted while in development (eg "localhost").
  const [id, setId] = useState<string>(props.id || '');

  const getResolution = (id: string) => (model?.peers || {})[id]?.resolution?.body;
  const resolution = getResolution(id);

  const videoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream>();

  const loadLocalStream = async () => {
    if (!localStreamRef.current) {
      const constraints: MediaStreamConstraints = { video: true, audio: true };
      const localStream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = localStream;
    }
    return localStreamRef.current;
  };

  const loadAsSelf = async () => {
    const video = videoRef.current as HTMLVideoElement;
    video.srcObject = await loadLocalStream();
  };

  const startRemoteVideoCall = (targetId: string) => {
    const video = videoRef.current as HTMLVideoElement;
    const localStream = localStreamRef.current as MediaStream;
    const call = peer.call(targetId, localStream);
    call.on('stream', (remoteStream) => (video.srcObject = remoteStream));
  };

  const connectTo = async (targetId: string) => {
    startRemoteVideoCall(targetId);
    bus.fire({ type: 'Conversation/connect', payload: { id: targetId } });
  };

  useEffect(() => {
    if (isSelf) {
      loadAsSelf();
      setId(peer.id);
    } else {
      loadLocalStream().then(() => {
        if (props.id) connectTo(props.id);
      });
    }
  }, []); // eslint-disable-line

  /**
   * Listen for incoming calls.
   */
  useEffect(() => {
    if (!isSelf) {
      peer.on('call', async (call) => {
        // Connect the video stream.
        const video = videoRef.current as HTMLVideoElement;
        const localStream = localStreamRef.current;
        if (localStream) {
          call.answer(localStream);
          call.on('stream', (remoteStream) => (video.srcObject = remoteStream));
        }

        // Start data connection.
        const id = call.peer;
        setId(id);
        bus.fire({ type: 'Conversation/connect', payload: { id } });
      });
    }
  }, []); // eslint-disable-line

  const styles = {
    base: css({
      position: 'relative',
    }),
    video: {
      outer: css({
        position: 'relative',
        overflow: 'hidden',
        borderRadius: isCircle ? '100%' : 16,
        transition: `border-radius ${defaultValue(props.isCircleTransition, 100)}ms`,
        width,
        height,
        border: `solid 5px ${color.format(-0.1)}`,
        backgroundColor: color.format(1),
      }),
      object: css({
        objectFit: 'cover',
        width: '100%',
        height: '100%',
      }),
    },
    mute: {
      outer: css({
        pointerEvents: 'none',
        Absolute: 0,
        Flex: isCircle ? 'end-center' : 'end-end',
      }),
      inner: css({
        pointerEvents: 'auto',
        backgroundColor: color.format(0.8),
        padding: 8,
        borderRadius: 6,
        margin: 10,
      }),
    },
    footer: css({
      marginTop: 10,
      PaddingX: 8,
      minHeight: 16,
    }),
    resolution: css({
      Absolute: [-10, 8, null, 8],
      fontSize: 8,
      color: color.format(-0.3),
      Flex: 'center-center',
    }),
  };

  const onPlay = () => {
    console.log('<video>: onPlay');
  };

  const MicIcon = isMuted ? Icons.Mic.Off : Icons.Mic.On;

  const elMuteButton = !isSelf && (
    <div {...styles.mute.outer}>
      <Button onClick={() => setIsMuted((prev) => !prev)}>
        <div {...styles.mute.inner}>
          <MicIcon size={18} />
        </div>
      </Button>
    </div>
  );

  // const elTextbox = !isSelf && (
  //   <PeerTextbox
  //     value={id}
  //     onChange={(e) => setId(formatId(e.value))}
  //     onEnter={() => {
  //       connectTo(id);
  //     }}
  //   />
  // );

  const elPeerLabel = id && <PeerLabel id={id} isSelf={isSelf} />;

  const elResolution = resolution && (
    <div {...styles.resolution}>
      {resolution.width} x {resolution.height}
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.video.outer}>
        <video
          {...styles.video.object}
          ref={videoRef}
          autoPlay={autoPlay}
          muted={isMuted}
          onPlay={onPlay}
        />
        {elMuteButton}
      </div>
      {elResolution}
      <div {...styles.footer}>{elPeerLabel}</div>
    </div>
  );
};

/**
 * [Helpers]
 */

function formatId(value: string) {
  return (value || '')
    .trim()
    .replace(/^peer\:/, '')
    .trim();
}
