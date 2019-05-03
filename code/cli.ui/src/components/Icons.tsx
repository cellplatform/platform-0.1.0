import { Icon, IIcon, IIconProps } from '@platform/ui.icon';
export { IIcon, IIconProps };

import { GoRepo, GoTerminal } from 'react-icons/go';

/**
 * Icon collection.
 */
const icon = Icon.renderer;
export class Icons {
  public static Namespace = icon(GoRepo);
  public static Command = icon(GoTerminal);
}
