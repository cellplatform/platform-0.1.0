import { t } from '../../common';
import { copyBundle } from './TscCopy.bundle';
import { copyRefs } from './TscCopy.refs';

export const TscCopy: t.TscCopy = {
  bundle: copyBundle,
  refs: copyRefs,
};
