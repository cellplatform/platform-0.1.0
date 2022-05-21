import * as t from '../../common/types';

type DirectoryPath = string;

export type FsPathListTheme = 'Light' | 'Dark';
export type FsPathListDroppedHandler = (e: t.Dropped) => void;

/**
 * <Component>
 */
export type FsPathListCommonProps = {
  instance: t.FsViewInstance;
  scroll?: boolean;
  padding?: t.CssEdgesInput;
  selection?: t.ListSelectionConfig | boolean;
  droppable?: boolean; // Support drag-drop from host OS.
  tabIndex?: number;
  theme?: t.FsPathListTheme;
  style?: t.CssValue;
};

export type FsPathListProps = FsPathListCommonProps & {
  state?: t.ListStateLazy;
  files?: t.ManifestFile[];
  spinning?: boolean;
  onDrop?: FsPathListDroppedHandler;
};

export type FsPathListStatefulProps = FsPathListCommonProps & {
  dir?: DirectoryPath;
  onStateChange?: t.FsPathListStateChangedHandler;
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
 * Event Handlers
 */

export type FsPathListStateChangedHandler = (e: FsPathListStateChangedHandlerArgs) => void;
export type FsPathListStateChangedHandlerArgs = {
  kind: t.ListStateChange['kind'];
  from: FsPathListState;
  to: FsPathListState;
};
