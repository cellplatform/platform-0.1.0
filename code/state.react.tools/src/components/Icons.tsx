import { Icon, IIcon, IIconProps } from '@platform/ui.icon';
export { IIcon, IIconProps };

import { FiXCircle } from 'react-icons/fi';

/**
 * Icon collection.
 */
const icon = Icon.renderer;
export class Icons {
  public static Clear = icon(FiXCircle);
}
