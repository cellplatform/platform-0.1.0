import { Icon } from '@platform/ui.icon';
import { MdClose, MdSettingsInputAntenna } from 'react-icons/md';
import { FiMic, FiMicOff } from 'react-icons/fi';

const icon = Icon.renderer;

/**
 * Icon collection.
 */
export const Icons = {
  Close: icon(MdClose),
  Antenna: icon(MdSettingsInputAntenna),
  Mic: {
    On: icon(FiMic),
    Off: icon(FiMicOff),
  },
};
