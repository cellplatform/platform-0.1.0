import * as React from 'react';

type StringOrNumber = string | number;

/**
 * The layout configuration of a component being hosted.
 */
export type IHostLayout = {
  width?: number;
  height?: number;
  background?: number | string;
  border?: boolean | number | string;
  cropmarks?: boolean | number;
  position?: IHostLayoutPosition;
  label?: React.ReactNode | Partial<IHostLayoutLabel>;
};

export type IHostLayoutPosition = {
  absolute?: StringOrNumber | [StringOrNumber, StringOrNumber] | IHostLayoutAbsolute;
};

export type IHostLayoutAbsolute = {
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
};

export type IHostLayoutLabel = {
  topLeft: React.ReactNode;
  topRight: React.ReactNode;
  bottomLeft: React.ReactNode;
  bottomRight: React.ReactNode;
};
