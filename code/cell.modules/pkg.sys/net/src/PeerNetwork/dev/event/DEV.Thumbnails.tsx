import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, FileUtil } from '../common';
import { useFileList } from '../../hook';
import { DevImageFullscreen } from '../media';

export type DevThumbnailsProps = {
  bus: t.EventBus<any>;
  netbus: t.NetBus<any>;
  style?: CssValue;
};

export const DevThumbnails: React.FC<DevThumbnailsProps> = (props) => {
  const { netbus } = props;
  const bus = props.bus.type<t.DevEvent>();
  const files = useFileList(netbus);

  const showModal = (file: t.PeerFile) => {
    const el = <DevImageFullscreen bus={bus} file={file} />;
    bus.fire({
      type: 'DEV/modal',
      payload: { el, target: 'body' },
    });
  };

  const styles = { base: css({}) };

  const elThumbnails = files.list.map((file, i) => {
    const style = {
      Size: 32,
      display: 'inline-block',
      backgroundSize: 'cover',
      backgroundImage: `url(${FileUtil.toDataUri(file.data, file.mimetype)})`,
      border: `solid 1px ${color.format(-0.2)}`,
      borderRadius: 5,
      marginRight: 5,
    };
    return <div key={i} {...css(style)} onClick={() => showModal(file)} />;
  });

  return <div {...css(styles.base, props.style)}>{elThumbnails}</div>;
};
