import { t } from '../common';

import { PositioningLayerProps, PositioningSizeHandler, PositioningSize } from '..';

type Size = { width?: number; height?: number };

export type Ctx = {
  props: PositioningLayerProps;
  child: Size;
  debug: { background: boolean; isConfigEnabled?: boolean; size?: PositioningSize };
  onSize?: PositioningSizeHandler;
};
