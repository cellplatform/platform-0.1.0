import { Icon } from '@platform/ui.icon';
import {
  MdFace,
  MdFullscreen,
  MdFullscreenExit,
  MdClose,
  MdPlayArrow,
  MdPause,
  MdAllInclusive,
} from 'react-icons/md';

const icon = Icon.renderer;

export const Icons = {
  Face: icon(MdFace),
  Close: icon(MdClose),
  Fullscreen: { Enter: icon(MdFullscreen), Exit: icon(MdFullscreenExit) },
  Play: icon(MdPlayArrow),
  Pause: icon(MdPause),
  Loop: icon(MdAllInclusive),
};
