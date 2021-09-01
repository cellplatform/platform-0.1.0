import { t } from '../../common';

export function toItems(input?: (t.DotTabstripItem | string)[]) {
  return (input || []).map((item) => {
    return typeof item === 'object' ? item : { label: item, value: item };
  });
}
