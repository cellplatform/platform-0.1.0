import { Icon } from '@platform/ui.icon';
import { GoOctoface } from 'react-icons/go';
import { MdExtension, MdFace, MdClose, MdImportContacts } from 'react-icons/md';

import { FiCameraOff } from 'react-icons/fi';

const icon = Icon.renderer;

export const Icons = {
  Face: icon(MdFace),
  LegoBlock: icon(MdExtension),
  Github: icon(GoOctoface),
  Close: icon(MdClose),
  Book: icon(MdImportContacts),
  Image: { Fail: icon(FiCameraOff) },
};
