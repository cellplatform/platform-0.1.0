import { ReactNode } from 'react';
import { t } from '../common';

type StringOrNumber = string | number;

/**
 * The layout configuration of a component being hosted.
 */
export type HostedLayout = {
  width?: number;
  height?: number;
  background?: StringOrNumber;
  border?: boolean | number | string;
  cropmarks?: boolean | number;
  label?: ReactNode | Partial<HostedLabel>;
  labelColor?: string | number;
  position?:
    | StringOrNumber
    | [StringOrNumber, StringOrNumber]
    | [StringOrNumber, StringOrNumber, StringOrNumber, StringOrNumber]
    | t.AbsolutePosition;
};

export type HostedLabel = {
  topLeft: ReactNode;
  topRight: ReactNode;
  bottomLeft: ReactNode;
  bottomRight: ReactNode;
};
