import { CssValue as t } from '@platform/css';
import { MouseEvent, MouseEventHandler, mouse } from '@platform/react';
export { MouseEvent, MouseEventHandler };

/**
 * An <Icon> component function.
 */
export type IIcon = (props: IIconProps) => JSX.Element;

/**
 * Display properties for an icon.
 */
export type IIconProps = mouse.IMouseEventProps & {
  size?: number;
  color?: number | string;
  opacity?: number;
  style?: t;
};
