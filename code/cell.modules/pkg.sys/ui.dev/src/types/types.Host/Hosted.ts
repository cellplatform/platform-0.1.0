import * as React from 'react';
import { t } from '../common';

type ReactNode = React.ReactNode;
type StringOrNumber = string | number;

/**
 * The layout configuration of a component being hosted.
 */
export type IDevHostedLayout = {
  width?: number;
  height?: number;
  background?: StringOrNumber;
  border?: boolean | number | string;
  cropmarks?: boolean | number;
  label?: ReactNode | Partial<IDevHostedLabel>;
  labelColor?: string | number;
  position?: StringOrNumber | [StringOrNumber, StringOrNumber] | t.IDevAbsolutePosition;
};

export type IDevHostedLabel = {
  topLeft: ReactNode;
  topRight: ReactNode;
  bottomLeft: ReactNode;
  bottomRight: ReactNode;
};
