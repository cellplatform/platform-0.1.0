import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t } from '../common';
import { CmdBar } from '..';

import { PositioningLayout } from '../../PositioningLayout';

export type DevLayoutProps = {
  instance: t.CmdBarInstance;
  style?: CssValue;
};

export const DevLayout: React.FC<DevLayoutProps> = (props) => {
  const { instance } = props;

  const styles = {
    base: css({ Absolute: 0 }),
  };

  const infoLayer: t.PositioningLayer = {
    id: 'info',
    position: { x: 'center', y: 'bottom' },
    render(e) {
      return <CmdBar.Grammer.Info instance={instance} />;
    },
  };

  return <PositioningLayout layers={[infoLayer]} style={styles.base} />;
};
