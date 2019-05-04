import { Icon, IIcon, IIconProps } from '@platform/ui.icon';
export { IIcon, IIconProps };

import { MdFace } from 'react-icons/md';

/**
 * Icon collection.
 */
const icon = Icon.renderer;
export class Icons {
  public static Face = icon(MdFace);
}
