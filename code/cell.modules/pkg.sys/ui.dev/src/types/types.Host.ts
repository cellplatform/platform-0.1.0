import * as React from 'react';

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
  position?: StringOrNumber | [StringOrNumber, StringOrNumber] | IDevHostedAbsolute;
  label?: ReactNode | Partial<IDevHostedLabel>;
};

export type IDevHostedAbsolute = {
  top?: StringOrNumber;
  right?: StringOrNumber;
  bottom?: StringOrNumber;
  left?: StringOrNumber;
};

export type IDevHostedLabel = {
  topLeft: ReactNode;
  topRight: ReactNode;
  bottomLeft: ReactNode;
  bottomRight: ReactNode;
};
