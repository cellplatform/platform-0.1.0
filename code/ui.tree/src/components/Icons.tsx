import { Icon, IIcon, IIconProps } from '@platform/ui.icon';
export { IIcon, IIconProps };

import {
  MdClose,
  MdFace,
  MdPlayArrow,
  MdHelpOutline,

  // Chevron.
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from 'react-icons/md';

/**
 * Icon collection.
 */
const icon = Icon.renderer;
export class Icons {
  public static Close = icon(MdClose);
  public static Face = icon(MdFace);
  public static PlayArrow = icon(MdPlayArrow);
  public static NotFound = icon(MdHelpOutline);

  // Chevron.
  public static ChevronLeft = icon(MdKeyboardArrowLeft);
  public static ChevronRight = icon(MdKeyboardArrowRight);
}
