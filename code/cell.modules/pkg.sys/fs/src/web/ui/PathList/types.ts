import * as t from '../common/types';

type DirectoryPath = string;

export type FsPathListTheme = 'Light' | 'Dark';
export type FsPathListDroppedHandler = (e: t.Dropped) => void;

/**
 * <Component>
 */
export type FsPathListCommonProps = {
  instance: t.FsViewInstance;
  scrollable?: boolean;
  selectable?: t.ListSelectionConfig | boolean;
  droppable?: boolean; // Support drag-drop from host OS.
  tabIndex?: number;
  theme?: t.FsPathListTheme;
  padding?: t.CssEdgesInput;
  style?: t.CssValue;
};

export type FsPathListProps = FsPathListCommonProps & {
  state?: t.ListStateLazy;
  cursor: FsPathListCursor;
  spinning?: boolean;
  onDrop?: FsPathListDroppedHandler;
};

export type FsPathListCursor = {
  total: number;
  getData: (index: number) => t.ManifestFile;
};

export type FsPathListStatefulProps = FsPathListCommonProps & {
  dir?: DirectoryPath;
  onStateChanged?: t.FsPathListStateChangedHandler;
};

/**
 * Item (Row)
 */
export type FsPathListItemData = {
  file: t.ManifestFile;
  theme: FsPathListTheme;
};

/**
 * State
 */
export type FsPathListState = t.ListState;

/**
 * [EVENT HANDLERS]
 */
export type FsPathListStateChangedHandler = (e: FsPathListStateChangedHandlerArgs) => void;
export type FsPathListStateChangedHandlerArgs = {
  kind: t.ListStateChange['kind'];
  from: FsPathListState;
  to: FsPathListState;
  fs: t.Fs;
};
