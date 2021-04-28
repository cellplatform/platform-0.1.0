import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, FileUtil } from '../common';
import { DevModal } from '../DEV.Modal';

export type DevImageFullscreenProps = {
  bus: t.EventBus<any>;
  file: t.PeerFile;
  style?: CssValue;
};

export const DevImageFullscreen: React.FC<DevImageFullscreenProps> = (props) => {
  const { bus, file } = props;

  const uri = FileUtil.toDataUri(file.data, file.mimetype);

  const styles = {
    base: css({
      flex: 1,
      position: 'relative',
      backgroundColor: color.format(1),
    }),
    image: css({
      Absolute: 20,
      backgroundSize: 'cover',
      backgroundImage: `url(${uri})`,
      backgroundPosition: 'center center',
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <DevModal bus={bus}>
        <div {...styles.image} />
      </DevModal>
    </div>
  );
};
