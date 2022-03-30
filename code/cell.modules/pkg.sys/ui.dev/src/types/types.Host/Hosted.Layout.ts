import { ReactNode } from 'react';
import { t } from '../common';

type StringOrNumber = string | number;
type StringOrNumberOrNil = string | number | null | undefined;

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
  offset?: [number, number]; // x,y
  position?:
    | StringOrNumber
    | [StringOrNumberOrNil, StringOrNumberOrNil]
    | [StringOrNumberOrNil, StringOrNumberOrNil, StringOrNumberOrNil, StringOrNumberOrNil]
    | t.EdgePosition;
};

export type HostedLabel = {
  topLeft: ReactNode;
  topRight: ReactNode;
  bottomLeft: ReactNode;
  bottomRight: ReactNode;
};
