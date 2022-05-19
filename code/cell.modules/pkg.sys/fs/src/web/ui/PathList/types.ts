import * as t from '../../common/types';

export type PathListTheme = 'Light' | 'Dark';

/**
 * <Component>
 */
export type PathListProps = {
  instance?: { bus: t.EventBus<any>; id: string };
  files?: t.ManifestFile[];
  scroll?: boolean;
  spinning?: boolean;
  padding?: t.CssEdgesInput;
  selection?: t.ListSelectionConfig | boolean;
  tabIndex?: number;
  theme?: t.PathListTheme;
  style?: t.CssValue;
};

export type PathListItemData = {
  theme: PathListTheme;
  file: t.ManifestFile;
};
