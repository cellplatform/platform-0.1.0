import { Icon, IIcon, IIconProps } from '@platform/ui.icon';
export { IIcon, IIconProps };

import {
  // Chevron.
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardArrowUp,
  MdKeyboardArrowDown,
} from 'react-icons/md';

import { FiBox, FiLayers, FiGitPullRequest } from 'react-icons/fi';

/**
 * Icon collection.
 */
const icon = Icon.renderer;
export class Icons {
  // Feather.
  public static Object = icon(FiBox);
  public static Array = icon(FiLayers);
  public static Function = icon(FiGitPullRequest);

  // Chevron.
  public static ChevronLeft = icon(MdKeyboardArrowLeft);
  public static ChevronRight = icon(MdKeyboardArrowRight);
  public static ChevronUp = icon(MdKeyboardArrowUp);
  public static ChevronDown = icon(MdKeyboardArrowDown);
}
