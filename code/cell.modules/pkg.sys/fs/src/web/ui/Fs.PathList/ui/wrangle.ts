import { List, t } from '../common';

export const wrangle = {
  tabIndex(props: t.FsPathListProps) {
    if (typeof props.tabIndex === 'number') return props.tabIndex;
    if (List.wrangle.selection(props.selection).keyboard) return -1;
    return undefined;
  },
};
