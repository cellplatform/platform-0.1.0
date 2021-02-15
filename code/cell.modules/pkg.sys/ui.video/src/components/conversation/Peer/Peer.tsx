import React, { useEffect, useRef, useState } from 'react';
import { css, CssValue, t, color, defaultValue, cuid, PeerJS } from '../common';
import { TextInput } from '../../Primitives';

const getUserMedia = navigator.mediaDevices.getUserMedia;

export type PeerProps = {
  peer: PeerJS;
  isSelf?: boolean;
  width?: number;
  height?: number;
  autoPlay?: boolean;
  muted?: boolean;
  style?: CssValue;
};

export const Peer: React.FC<PeerProps> = (props) => {
  const { width = 300, height = 200, isSelf, peer } = props;
  const autoPlay = defaultValue(props.autoPlay, true);
  const muted = defaultValue(props.muted, false);

  const [id, setId] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream>();

  const loadLocalStream = async () => {
    if (localStreamRef.current) return localStreamRef.current;

    const constraints: MediaStreamConstraints = { video: true, audio: true };
    const localStream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = localStream;

    return localStream;
  };

  const loadAsSelf = async () => {
    const video = videoRef.current as HTMLVideoElement;
    video.srcObject = await loadLocalStream();
  };

  const connectToPeer = (id: string) => {
    if (!peer) throw new Error(`The WebRTC peer has not been initialized.`);
    const video = videoRef.current as HTMLVideoElement;
    const localStream = localStreamRef.current as MediaStream;

    console.log('peer', peer);
    console.log('video', video);

    console.log('localStream', localStream);

    const call = peer.call(id, localStream);

    console.log('call', call);

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

  useEffect(() => {
    peer.on('call', async (call) => {
      const video = videoRef.current as HTMLVideoElement;
      const localStream = localStreamRef.current;
      if (localStream) {
        call.answer(localStream);
        call.on('stream', (remoteStream) => (video.srcObject = remoteStream));
      }
    });
  }, []); // eslint-disable-line

  const styles = {
    base: css({}),
    video: {
      outer: css({
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
    footer: css({
      marginTop: 10,
      PaddingX: 8,
    }),
  };

  const onPlay = () => {
    console.log('<video>: onPlay');
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.video.outer}>
        <video
          {...styles.video.object}
          ref={videoRef}
          autoPlay={autoPlay}
          muted={muted}
          onPlay={onPlay}
        />
      </div>
      <div {...styles.footer}>
        <TextInput
          value={id}
          placeholder={'connect to (peer)'}
          valueStyle={{ fontFamily: 'sans-serif' }}
          placeholderStyle={{ italic: true, color: color.format(-0.3) }}
          disabledOpacity={1}
          onChange={(e) => setId(e.to)}
          spellCheck={false}
          isEnabled={!isSelf}
          onEnter={() => connectToPeer(id)}
        />
      </div>
    </div>
  );
};
