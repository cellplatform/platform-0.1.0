import { t } from '../common';

import { PositioningContainerProps, PositioningSizeHandler } from '..';

type Size = { width?: number; height?: number };

export type Ctx = {
  props: PositioningContainerProps;
  child: Size;
  debug: {
    background: boolean;
    isConfigEnabled?: boolean;
    size?: { root: t.DomRect; child: t.DomRect };
  };
  onSize?: PositioningSizeHandler;
};
