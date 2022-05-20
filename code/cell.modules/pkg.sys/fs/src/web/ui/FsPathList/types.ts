import * as t from '../../common/types';

type DirectoryPath = string;

export type PathListTheme = 'Light' | 'Dark';
export type PathListDroppedHandler = (e: t.Dropped) => void;

/**
 * <Component>
 */
type PathListCommonProps = {
  instance: t.FsViewInstance;
  scroll?: boolean;
  padding?: t.CssEdgesInput;
  selection?: t.ListSelectionConfig | boolean;
  droppable?: boolean; // Support drag-drop from host OS.
  tabIndex?: number;
  theme?: t.PathListTheme;
  style?: t.CssValue;
};

export type PathListProps = PathListCommonProps & {
  files?: t.ManifestFile[];
  spinning?: boolean;
  onDrop?: PathListDroppedHandler;
};

export type PathListStatefulProps = PathListCommonProps & {
  dir?: DirectoryPath;
};

/**
 * Item (Row)
 */
export type PathListItemData = {
  file: t.ManifestFile;
  theme: PathListTheme;
};
