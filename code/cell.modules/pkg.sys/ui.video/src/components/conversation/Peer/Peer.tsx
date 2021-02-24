import React, { useEffect, useRef, useState } from 'react';

import { Icons } from '../../Icons';
import { Button } from '../../Primitives';
import { color, css, CssValue, defaultValue, PeerJS, t } from '../common';
import { PeerLabel } from './Peer.Label';
import { PeerTextbox } from './Peer.Textbox';

export type PeerProps = {
  bus: t.EventBus<any>;
  peer: PeerJS;
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
  const { isSelf, peer, isCircle } = props;
  const autoPlay = defaultValue(props.autoPlay, true);
  const bus = props.bus.type<t.PeerEvent>();

  const height = props.height || 200;
  let width = props.width || 300;
  width = isCircle ? height : width;

  const [isMuted, setIsMuted] = useState<boolean>(props.isMuted || false);
  const [id, setId] = useState<string>('');

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

  const startRemoteCall = (targetId: string) => {
    const video = videoRef.current as HTMLVideoElement;
    const localStream = localStreamRef.current as MediaStream;
    const call = peer.call(targetId, localStream);
    call.on('stream', (remoteStream) => (video.srcObject = remoteStream));
  };

  useEffect(() => {
    if (isSelf) {
      loadAsSelf();
      setId(peer.id);
    } else {
      loadLocalStream();
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
        bus.fire({ type: 'Peer/connect', payload: { id: call.peer } });
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
    mic: {
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
    }),

    temp: css({
      Absolute: [null, 0, 0, null],
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    }),
  };

  const onPlay = () => {
    console.log('<video>: onPlay');
  };

  const MicIcon = isMuted ? Icons.Mic.Off : Icons.Mic.On;

  const elMicIcon = (
    <div {...styles.mic.outer}>
      <Button onClick={() => setIsMuted((prev) => !prev)}>
        <div {...styles.mic.inner}>
          <MicIcon size={18} />
        </div>
      </Button>
    </div>
  );

  const elTextbox = !isSelf && (
    <PeerTextbox
      value={id}
      onChange={(e) => {
        setId(e.value);
      }}
      onEnter={() => {
        startRemoteCall(id);
        bus.fire({ type: 'Peer/connect', payload: { id } });
      }}
    />
  );

  const elPeerLabel = isSelf && <PeerLabel id={id} isSelf={isSelf} />;

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
        {elMicIcon}
      </div>
      <div {...styles.footer}>{elTextbox || elPeerLabel}</div>
    </div>
  );
};
