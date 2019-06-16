import * as React from 'react';

export type TabstripAxis = 'x' | 'y';

export type TabFactory<D = any> = (e: TabFactoryArgs<D>) => React.ReactNode;
export type TabFactoryArgs<D = any> = {
  index: number;
  data: D;
  axis: TabstripAxis;
  collection?: string | number;
  isVertical: boolean;
  isHorizontal: boolean;
  isFirst: boolean;
  isLast: boolean;
};
