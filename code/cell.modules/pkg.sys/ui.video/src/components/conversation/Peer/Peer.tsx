import React, { useEffect, useRef, useState } from 'react';
import { css, CssValue, t, color, defaultValue, cuid, PeerJS } from '../common';
import { TextInput, Button } from '../../Primitives';
import { Icons } from '../../Icons';

import { PeerLabel } from './PeerLabel';

export type PeerProps = {
  peer: PeerJS;
  isSelf?: boolean;
  width?: number;
  height?: number;
  autoPlay?: boolean;
  style?: CssValue;
};

export const Peer: React.FC<PeerProps> = (props) => {
  const { width = 300, height = 200, isSelf, peer } = props;
  const autoPlay = defaultValue(props.autoPlay, true);

  const [isMuted, setIsMuted] = useState<boolean>(true);

  // const isMuted = defaultValue(props.isMuted, false);

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

  const startRemoteCall = (id: string) => {
    if (!peer) throw new Error(`The WebRTC peer has not been initialized.`);
    const video = videoRef.current as HTMLVideoElement;
    const localStream = localStreamRef.current as MediaStream;
    const call = peer.call(id, localStream);
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
        const video = videoRef.current as HTMLVideoElement;
        const localStream = localStreamRef.current;
        if (localStream) {
          call.answer(localStream);
          call.on('stream', (remoteStream) => (video.srcObject = remoteStream));
        }
      });
    }
  }, []); // eslint-disable-line

  const styles = {
    base: css({}),
    video: {
      outer: css({
        position: 'relative',
        width,
        height,
        border: `solid 5px ${color.format(-0.1)}`,
        overflow: 'hidden',
        borderRadius: 16,
      }),
      object: css({
        objectFit: 'contain',
        width: '100%',
      }),
    },
    mic: {
      outer: css({
        Absolute: [null, 10, 10, null],
      }),
      inner: css({
        backgroundColor: color.format(0.8),
        padding: 8,
        borderRadius: 6,
      }),
    },
    footer: css({
      marginTop: 10,
      PaddingX: 8,
    }),
  };

  const onPlay = () => {
    console.log('<video>: onPlay');
  };

  const MicIcon = isMuted ? Icons.Mic.Off : Icons.Mic.On;

  const elMic = (
    <div {...styles.mic.outer}>
      <Button onClick={() => setIsMuted((prev) => !prev)}>
        <div {...styles.mic.inner}>
          <MicIcon size={18} />
        </div>
      </Button>
    </div>
  );

  const elTextbox = !isSelf && (
    <TextInput
      value={id}
      placeholder={'Connect to ("peer")'}
      valueStyle={{ fontFamily: 'sans-serif', fontSize: 14 }}
      placeholderStyle={{ italic: true, color: color.format(-0.3) }}
      disabledOpacity={1}
      onChange={(e) => setId(e.to)}
      spellCheck={false}
      isEnabled={!isSelf}
      onEnter={() => startRemoteCall(id)}
    />
  );

  const elPeerLabel = isSelf && <PeerLabel id={id} />;

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
        {elMic}
      </div>
      <div {...styles.footer}>{elTextbox || elPeerLabel}</div>
    </div>
  );
};
