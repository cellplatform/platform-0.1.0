import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, FileUtil } from '../common';
import { useFileList } from '../../hook';
import { DevImageFullscreen } from '../media';

export type DevImageThumbnailsProps = {
  bus: t.EventBus<any>;
  netbus: t.PeerBus<any>;
  style?: CssValue;
};

export const DevImageThumbnails: React.FC<DevImageThumbnailsProps> = (props) => {
  const { netbus } = props;
  const bus = props.bus.type<t.DevEvent>();
  const files = useFileList(netbus);

  const showModal = (file: t.PeerFile, uri: string) => {
    const el = <DevImageFullscreen bus={bus} file={file} uri={uri} />;
    bus.fire({
      type: 'DEV/modal',
      payload: { el, target: 'body' },
    });
  };

  const styles = {
    base: css({}),
  };

  const elThumbnails = files.list.map((item, i) => {
    const { file, uri } = item;
    const style = {
      Size: 32,
      display: 'inline-block',
      backgroundSize: 'cover',
      backgroundImage: `url(${uri})`,
      border: `solid 1px ${color.format(-0.2)}`,
      borderRadius: 5,
      marginRight: 5,
    };
    return <div key={i} {...css(style)} onClick={() => showModal(file, uri)} />;
  });

  return <div {...css(styles.base, props.style)}>{elThumbnails}</div>;
};
