import { Icon } from '@platform/ui.icon';

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

import { FiBox } from 'react-icons/fi';

const icon = Icon.renderer;

export const Icons = {
  Add: icon(MdAddCircleOutline),
  Close: icon(MdClose),
  Tick: icon(MdCheck),
  Face: icon(MdFace),
  Box: icon(FiBox),

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
