import { Icon, IIcon, IIconProps } from '../../src';
export { IIcon, IIconProps };

import {
  MdAddCircleOutline,
  MdClose,
  MdCheck,
  MdCreate,
  MdFace,
  MdPlayArrow,
  MdRefresh,
  MdSave,
  MdSwapCalls,
  MdStyle,

  // Padlock.
  MdLockOutline,
  MdLockOpen,

  // Log.
  MdInfo,
  MdInfoOutline,
  MdWarning,
  MdError,
  MdErrorOutline,

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
export class Icons {
  public static Add = icon(MdAddCircleOutline);
  public static Close = icon(MdClose);
  public static Tick = icon(MdCheck);
  public static EditPencil = icon(MdCreate);
  public static Face = icon(MdFace);
  public static PlayArrow = icon(MdPlayArrow);
  public static Refresh = icon(MdRefresh);
  public static Save = icon(MdSave);
  public static SwapCalls = icon(MdSwapCalls);
  public static Style = icon(MdStyle);

  // Padlock.
  public static Lock = icon(MdLockOutline);
  public static LockOpen = icon(MdLockOpen);

  // Log.
  public static Info = icon(MdInfo);
  public static InfoOutline = icon(MdInfoOutline);
  public static Warning = icon(MdWarning);
  public static Error = icon(MdError);
  public static ErrorOutline = icon(MdErrorOutline);

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
