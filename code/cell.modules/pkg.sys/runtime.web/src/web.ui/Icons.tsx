import { Icon } from '@platform/ui.icon';
import {
  MdArrowBack,
  MdArrowForward,
  MdExtension,
  MdSettingsInputAntenna,
  MdLink,
} from 'react-icons/md';

const icon = Icon.renderer;

/**
 * Icon collection.
 */
export const Icons = {
  Antenna: icon(MdSettingsInputAntenna),
  Arrow: { Back: icon(MdArrowBack), Forward: icon(MdArrowForward) },
  Extension: icon(MdExtension),
  Link: icon(MdLink),
};
