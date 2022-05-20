import { List } from './common';
import { PathListProps } from './types';

export const wrangle = {
  tabIndex(props: PathListProps) {
    if (typeof props.tabIndex === 'number') return props.tabIndex;
    if (List.wrangle.selection(props.selection).keyboard) return -1;
    return undefined;
  },
};
