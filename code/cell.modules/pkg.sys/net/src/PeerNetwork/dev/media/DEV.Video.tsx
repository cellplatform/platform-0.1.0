import { defaultValue } from '@platform/util.value';
import React, { useState, useRef } from 'react';
import { useClickWithin, useClickOutside } from '@platform/react';

import {
  AudioWaveform,
  color,
  css,
  CssValue,
  Icons,
  PropList,
  PropListItem,
  VideoStream,
  MediaStream,
  Button,
  COLORS,
  t,
} from '../common';

export type DevVideoProps = {
  bus: t.EventBus<any>;
  kind: t.PeerConnectionKindMedia;
  isSelf?: boolean;
  stream?: MediaStream;
  width?: number;
  height?: number;
  style?: CssValue;
  isVideoMuted?: boolean;
  show?: { proplist?: boolean; waveform?: boolean };
  selected?: {
    showBorder?: boolean;
    handler?: (e: { isSelected: boolean }) => void;
  };
};

export const DevVideo: React.FC<DevVideoProps> = (props) => {
  const { width = 150, height = 100, stream, kind, isSelf } = props;
  const show = { proplist: props.show?.proplist ?? true, waveform: props.show?.waveform ?? true };
  const isVideo = kind === 'media/video';
  const bus = props.bus.type<t.DevEvent>();
  const wifi = MediaStream.useOfflineState();

  const playerRef = useRef<HTMLDivElement>(null);

  const [isVideoMuted, setVideoMuted] = useState<boolean>(defaultValue(props.isVideoMuted, true));
  const toggleVideoMuted = () => setVideoMuted((prev) => !prev);

  const [isSelected, setSelected] = useState<boolean>(false);
  useClickWithin('down', playerRef, () => onSelectionChanged(true));
  useClickOutside('down', playerRef, () => onSelectionChanged(false));
  const onSelectionChanged = (isSelected: boolean) => {
    setSelected(isSelected);
    props.selected?.handler?.({ isSelected });
  };

  const MARGIN = { waveform: 10 };
  const styles = {
    base: css({
      boxSizing: 'border-box',
      position: 'relative',
    }),
    video: {
      base: css({
        position: 'relative',
        backgroundColor: color.format(-0.02),
        border: `solid 1px ${color.format(-0.03)}`,
        borderRadius: 20,
        width,
        height,
        marginBottom: 4,
      }),
      border: css({
        Absolute: -2,
        border: `solid 2px ${COLORS.BLUE}`,
        borderRadius: 22,
        pointerEvents: 'none',
      }),
      stream: css({
        Absolute: [0, null, null, 0],
        opacity: wifi.offline ? 0.12 : 1,
      }),
      overlay: css({
        Absolute: 0,
        pointerEvents: 'none',
        Flex: 'horizontal-center-center',
      }),
    },
    waveform: {
      base: css({ MarginX: MARGIN.waveform }),
    },
  };

  const elVideoOverlay = wifi.offline && (
    <div {...styles.video.overlay}>
      <Icons.Wifi.Off />
    </div>
  );

  const items: PropListItem[] = [
    {
      label: 'mic',
      value: {
        data: !isVideoMuted,
        kind: 'Switch',
        onClick: toggleVideoMuted,
      },
    },
    {
      label: 'size',
      value: (
        <Button
          label={'Full Screen'}
          onClick={() =>
            bus.fire({
              type: 'DEV/media/modal',
              payload: { stream, target: 'body', isSelf },
            })
          }
        />
      ),
    },
  ];

  const tooltip = stream ? `stream.id: ${stream.id}` : `Stream not loaded`;

  const elWaveform = isVideo && show.waveform && (
    <div {...styles.waveform.base}>
      <AudioWaveform stream={stream} width={width - MARGIN.waveform * 2} height={15} />
    </div>
  );

  const elSelectionBorder = props.selected?.showBorder && isSelected && (
    <div {...styles.video.border} />
  );

  return (
    <div {...css(styles.base, props.style)}>
      <div ref={playerRef} {...styles.video.base} title={tooltip}>
        <VideoStream
          stream={stream}
          width={width}
          height={height}
          isMuted={isVideo ? isVideoMuted : true}
          style={styles.video.stream}
        />
        {elVideoOverlay}
        {elSelectionBorder}
      </div>
      {elWaveform}
      {show.proplist && <PropList items={items} />}
    </div>
  );
};
