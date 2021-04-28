import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../common';
import { DevModal } from '../DEV.Modal';

export type DevImageFullscreenProps = {
  bus: t.EventBus<any>;
  uri: string;
  style?: CssValue;
};

export const DevImageFullscreen: React.FC<DevImageFullscreenProps> = (props) => {
  const { bus, uri } = props;
  const styles = {
    base: css({
      flex: 1,
      position: 'relative',
      backgroundColor: color.format(1),
    }),
    image: css({
      Absolute: 0,
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
