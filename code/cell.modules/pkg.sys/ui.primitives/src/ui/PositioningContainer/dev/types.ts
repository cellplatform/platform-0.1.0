import { t } from '../common';

import { PositioningContainerProps, PositioningSizeHandler, PositioningSize } from '..';

type Size = { width?: number; height?: number };

export type Ctx = {
  props: PositioningContainerProps;
  child: Size;
  debug: {
    background: boolean;
    isConfigEnabled?: boolean;
    size?: PositioningSize;
  };
  onSize?: PositioningSizeHandler;
};
