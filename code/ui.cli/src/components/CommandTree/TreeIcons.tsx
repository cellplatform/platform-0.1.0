import { Icon, IIcon, IIconProps } from '@platform/ui.icon';
export { IIcon, IIconProps };

import {
  MdAddCircleOutline,
  MdClose,
  MdCheck,
  MdFace,

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

/**
 * Icon collection.
 */
const icon = Icon.renderer;
export class TreeIcons {
  public static Add = icon(MdAddCircleOutline);
  public static Close = icon(MdClose);
  public static Tick = icon(MdCheck);
  public static Face = icon(MdFace);

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
