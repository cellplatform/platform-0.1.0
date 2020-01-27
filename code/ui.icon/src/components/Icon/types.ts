import { CssValue, MouseEvent, MouseEventHandler, mouse } from '../../common';
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
  style?: CssValue;
};
