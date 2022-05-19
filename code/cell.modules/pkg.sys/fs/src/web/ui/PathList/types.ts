import * as t from '../../common/types';

type FilesystemId = string;
type DirectoryPath = string;

export type PathListTheme = 'Light' | 'Dark';

export type PathListInstance = { bus: t.EventBus<any>; id: FilesystemId };

/**
 * <Component>
 */
type PathListCommonProps = {
  instance: PathListInstance;
  scroll?: boolean;
  padding?: t.CssEdgesInput;
  selection?: t.ListSelectionConfig | boolean;
  tabIndex?: number;
  theme?: t.PathListTheme;
  style?: t.CssValue;
};

export type PathListProps = PathListCommonProps & {
  files?: t.ManifestFile[];
  spinning?: boolean;
};

export type PathListStatefulProps = PathListCommonProps & {
  dir?: DirectoryPath;
};

/**
 * Item
 */
export type PathListItemData = {
  theme: PathListTheme;
  file: t.ManifestFile;
};
