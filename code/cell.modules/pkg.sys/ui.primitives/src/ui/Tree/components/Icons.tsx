import { Icon, IIcon, IIconProps } from '@platform/ui.icon';
export { IIcon, IIconProps };

import { FiBox } from 'react-icons/fi';

import {
  MdClose,
  MdFace,
  MdPlayArrow,
  MdHelpOutline,

  // Arrow.
  MdArrowBack,
  MdArrowForward,
  MdArrowUpward,
  MdArrowDownward,

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
  public static Box = icon(FiBox);

  // Arrow.
  public static ArrowLeft = icon(MdArrowBack);
  public static ArrowRight = icon(MdArrowForward);
  public static ArrowUp = icon(MdArrowUpward);
  public static ArrowDown = icon(MdArrowDownward);

  // Chevron.
  public static ChevronLeft = icon(MdKeyboardArrowLeft);
  public static ChevronRight = icon(MdKeyboardArrowRight);
}
