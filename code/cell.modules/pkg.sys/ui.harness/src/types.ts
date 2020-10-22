/**
 * The layout configuration of a component being hosted.
 */
export type IHostLayout = {
  width?: number | string;
  height?: number | string;
  background?: number | string;
  border?: boolean | number | string;
  cropmarks?: boolean | number;
  position?: IHostLayoutPosition;
};

export type IHostLayoutPosition = {
  absolute?: IHostLayoutAbsolute;
};

export type IHostLayoutAbsolute = {
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
};
