import { Icon, IIcon, IIconProps } from '@platform/ui.icon';
import {
  FiBook,
  FiBookOpen,
  FiClipboard,
  FiFilePlus,
  FiFolder,
  FiPlusCircle,
  FiPlusSquare,
  FiRefreshCw,
  FiRss,
  FiColumns,
  FiUnlock,
  FiUser,
  FiEdit,
  FiX,
  FiSliders,
  FiSettings,
  FiTrash,
  FiSidebar,
} from 'react-icons/fi';
import {
  MdArrowBack,
  MdArrowDownward,
  MdArrowForward,
  MdArrowUpward,
  MdKeyboardArrowDown,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardArrowUp,
  MdMoreHoriz,
  MdMoreVert,
} from 'react-icons/md';

import { TiPin, TiPinOutline } from 'react-icons/ti';

export { IIcon, IIconProps };

/**
 * Icon collection.
 */
const icon = Icon.renderer;
export class Icons {
  public static User = icon(FiUser);
  public static Padlock = icon(FiUnlock);
  public static Clipboard = icon(FiClipboard);
  public static Network = icon(FiRss);
  public static NewFile = icon(FiFilePlus);
  public static Open = icon(FiBookOpen);
  public static Book = icon(FiBook);
  public static Refresh = icon(FiRefreshCw);
  public static Folder = icon(FiFolder);
  public static Columns = icon(FiColumns);
  public static PlusSquare = icon(FiPlusSquare);
  public static PlusCircle = icon(FiPlusCircle);
  public static Edit = icon(FiEdit);
  public static X = icon(FiX);
  public static Pin = icon(TiPin);
  public static PinOutline = icon(TiPinOutline);
  public static Sliders = icon(FiSliders);
  public static Settings = icon(FiSettings);
  public static Trash = icon(FiTrash);
  public static Sidebar = icon(FiSidebar);

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
