import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, time } from '../../common';
import PeerLib from 'peerjs';
import { TextInput } from '../Primitives';

export type PeerProps = {
  style?: CssValue;
};

export const Peer: React.FC<PeerProps> = (props) => {
  // const { id } = props;
  const [peer, setPeer] = useState<PeerLib>();
  const [id, setId] = useState<string>('');
  const [connectTo, setConnectTo] = useState<string>('');
  const videoSelfRef = useRef<HTMLVideoElement>(null);
  const videoOtherRef = useRef<HTMLVideoElement>(null);

  const localStreamRef = useRef<MediaStream>();

  useEffect(() => {
    const peer = new PeerLib();
    setPeer(peer);

    // Open connection
    peer.on('open', (id) => {
      console.log('open', id);
      console.log('peer.id', peer.id);
      setId(id);
    });

    // Start local media stream.
    (async () => {
      const videoSelf = videoSelfRef.current as HTMLVideoElement;
      const localStream = await getMedia({ video: true, audio: true });
      videoSelf.srcObject = localStream;
      localStreamRef.current = localStream;
    })();

    // Listen for incoming calls.
    peer.on('call', async (call) => {
      console.log('on call', call);

      const localStream = await getMedia({ video: true, audio: true });

      call.answer(localStream);
      call.on('stream', (remoteStream) => {
        const videoOther = videoOtherRef.current as HTMLVideoElement;
        videoOther.srcObject = remoteStream;
      });
    });

    return () => {
      peer.destroy();
    };
  }, []);

  const connect = async () => {
    const videoOther = videoOtherRef.current as HTMLVideoElement;

    if (peer) {
      // const conn = peer.connect(connectTo);
      // conn.on('open', () => {
      //   conn.send('hi!');
      // });

      // const localStream = await getMedia({ video: true, audio: true });
      // videoSelf.srcObject = localStream;

      const localStream = localStreamRef.current as MediaStream;

      const call = peer.call(connectTo, localStream);
      call.on('stream', (remoteStream) => {
        videoOther.srcObject = remoteStream;
      });
    }
  };

  const onPlay = () => {
    console.log('onPlay');
  };

  const styles = {
    base: css({
      flex: 1,
      Flex: 'vertical-stretch-stretch',
      boxSizing: 'border-box',
    }),
    body: css({
      flex: 1,
      padding: 20,
    }),
    videoOuter: css({
      marginTop: 60,
      Flex: 'horizontal-center-center',
    }),
    video: css({
      width: 200,
      height: 200,
      border: `solid 1px ${color.format(-0.1)}`,
      marginRight: 50,
      borderRadius: 8,
      ':last-child': {
        marginRight: 0,
      },
    }),
    footer: css({
      padding: 10,
      borderTop: `solid 1px ${color.format(-0.1)}`,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        <div>Peer: {id}</div>
        <div {...styles.videoOuter}>
          <video
            {...styles.video}
            ref={videoSelfRef}
            width={300}
            height={300}
            autoPlay={true}
            muted={true}
            onPlay={onPlay}
          />
          <video
            {...styles.video}
            ref={videoOtherRef}
            width={300}
            height={300}
            autoPlay={true}
            muted={false}
            onPlay={onPlay}
          />
        </div>
      </div>
      <div {...styles.footer}>
        <TextInput
          placeholder={'connect to'}
          value={connectTo}
          valueStyle={{ fontFamily: 'sans-serif' }}
          placeholderStyle={{ italic: true, color: color.format(-0.3) }}
          onChange={(e) => setConnectTo(e.to)}
          onEnter={connect}
        />
      </div>
    </div>
  );
};

/**
 * [Helpers]
 */

async function getMedia(constraints: MediaStreamConstraints) {
  let stream = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
    /* use the stream */
  } catch (err) {
    /* handle the error */
    throw err;
  }
}
