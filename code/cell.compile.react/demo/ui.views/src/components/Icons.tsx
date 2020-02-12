import { Icon, IIcon, IIconProps } from '@platform/ui.icon';
export { IIcon, IIconProps };

import {
  MdClose,
  MdRefresh,
  MdHistory,

  // Arrow.
  MdArrowBack,
  MdArrowForward,
  MdArrowUpward,
  MdArrowDownward,

  // Chevron.
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardArrowUp,
  MdKeyboardArrowDown,

  // More.
  MdMoreVert,
  MdMoreHoriz,
} from 'react-icons/md';

import { FiAward } from 'react-icons/fi';

/**
 * Icon collection.
 */
const icon = Icon.renderer;
export class Icons {
  public static Close = icon(MdClose);
  public static Refresh = icon(MdRefresh);
  public static History = icon(MdHistory);
  public static Award = icon(FiAward);

  // Arrow.
  public static ArrowLeft = icon(MdArrowBack);
  public static ArrowRight = icon(MdArrowForward);
  public static ArrowUp = icon(MdArrowUpward);
  public static ArrowDown = icon(MdArrowDownward);

  // Chevron.
  public static ChevronLeft = icon(MdKeyboardArrowLeft);
  public static ChevronRight = icon(MdKeyboardArrowRight);
  public static ChevronUp = icon(MdKeyboardArrowUp);
  public static ChevronDown = icon(MdKeyboardArrowDown);

  // More.
  public static MoreVertical = icon(MdMoreVert);
  public static MoreHorizontal = icon(MdMoreHoriz);
}
