import { t } from '../common';

/**
 * Identifiying characteristics of a development module.
 */
export type IComponent = {
  name: string;
};


/**
 * The data configuration of a component being hosted.
 */
export type IDevHost = {
  view: { component?: string; sidebar?: string };
  layout?: IDevHostLayout;
  component?: IComponent;
};

/**
 * The layout configuration of a component being hosted.
 */
export type IDevHostLayout = {
  width?: number | string;
  height?: number | string;
  background?: number | string;
  border?: boolean | number | string;
  cropmarks?: boolean | number;
  position?: IDevHostLayoutPosition;
};

export type IDevHostLayoutPosition = {
  absolute?: IDevHostLayoutAbsolute;
};

export type IDevHostLayoutAbsolute = {
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
};
