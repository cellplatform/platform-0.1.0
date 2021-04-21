import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, COLORS } from '../common';
import { DevModal } from '../DEV.Modal';

export type DevModelProps = { bus: t.EventBus<any>; style?: CssValue };

export const DevModel: React.FC<DevModelProps> = (props) => {
  const bus = props.bus.type<t.DevEvent>();

  const styles = {
    base: css({ flex: 1 }),
  };
  return (
    <DevModal bus={bus} style={props.style} background={1}>
      <div {...styles.base}>model</div>
    </DevModal>
  );
};
