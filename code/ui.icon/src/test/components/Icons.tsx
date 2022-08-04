import { Icon } from '../..';

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
export const Icons = {
  Add: icon(MdAddCircleOutline),
  Close: icon(MdClose),
  Tick: icon(MdCheck),
  EditPencil: icon(MdCreate),
  Face: icon(MdFace),
  PlayArrow: icon(MdPlayArrow),
  Refresh: icon(MdRefresh),
  Save: icon(MdSave),
  SwapCalls: icon(MdSwapCalls),
  Style: icon(MdStyle),

  // Padlock.
  Lock: icon(MdLockOutline),
  LockOpen: icon(MdLockOpen),

  // Log.
  Info: icon(MdInfo),
  InfoOutline: icon(MdInfoOutline),
  Warning: icon(MdWarning),
  Error: icon(MdError),
  ErrorOutline: icon(MdErrorOutline),

  // Arrow.
  ArrowLeft: icon(MdArrowBack),
  ArrowRight: icon(MdArrowForward),
  ArrowUp: icon(MdArrowUpward),
  ArrowDown: icon(MdArrowDownward),

  // Chevron.
  ChevronLeft: icon(MdKeyboardArrowLeft),
  ChevronRight: icon(MdKeyboardArrowRight),
  ChevronUp: icon(MdKeyboardArrowUp),
  ChevronDown: icon(MdKeyboardArrowDown),

  // More.
  MoreVertical: icon(MdMoreVert),
  MoreHorizontal: icon(MdMoreHoriz),
};
