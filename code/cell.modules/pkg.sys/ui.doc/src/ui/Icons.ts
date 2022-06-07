import { Icon } from '@platform/ui.icon';
import { GoOctoface } from 'react-icons/go';
import { MdExtension, MdFace, MdClose } from 'react-icons/md';

const icon = Icon.renderer;

export const Icons = {
  Face: icon(MdFace),
  LegoBlock: icon(MdExtension),
  Github: icon(GoOctoface),
  Close: icon(MdClose),
};
