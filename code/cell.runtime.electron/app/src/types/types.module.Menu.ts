/**
 * Menu Helpers
 */
export type MenuTree = {
  walk(visitor: MenuTreeVisitor): MenuTree;
  filter(filter: MenuTreeMatch): MenuTree;
  find<M extends MenuItem = MenuItem>(filter: MenuTreeMatch): M | undefined;
};

export type MenuTreeMatch = (args: MenuTreeMatchArgs) => boolean;
export type MenuTreeMatchArgs = {
  id: string;
  item: MenuItem;
  parent?: MenuItem;
};

export type MenuTreeVisitor = (args: MenuTreeVisitorArgs) => void;
export type MenuTreeVisitorArgs = MenuTreeMatchArgs & { stop(): void };

/**
 * Menu Object
 */
export type Menu = MenuItem[];

export type MenuItem = MenuItemNormal | MenuItemCheckbox | MenuItemRadio | MenuItemSeperator;

type MenuItemBase = {
  id?: string;
  label?: string;
  sublabel?: string;
  accelerator?: string; // Shortcut key.
  visible?: boolean;
  enabled?: boolean;
  toolTip?: string;
  role?: MenuItemRole;
  submenu?: Menu;
  click?: () => any;
};

export type MenuItemNormal = MenuItemBase & { type: 'normal' };
export type MenuItemCheckbox = MenuItemBase & { type: 'checkbox' };
export type MenuItemRadio = MenuItemBase & { type: 'radio' };
export type MenuItemSeperator = { type: 'separator'; id?: string };

export type MenuItemRole =
  | 'undo'
  | 'redo'
  | 'cut'
  | 'copy'
  | 'paste'
  | 'pasteAndMatchStyle'
  | 'delete'
  | 'selectAll'
  | 'reload'
  | 'forceReload'
  | 'toggleDevTools'
  | 'resetZoom'
  | 'zoomIn'
  | 'zoomOut'
  | 'togglefullscreen'
  | 'window'
  | 'minimize'
  | 'close'
  | 'help'
  | 'about'
  | 'services'
  | 'hide'
  | 'hideOthers'
  | 'unhide'
  | 'quit'
  | 'startSpeaking'
  | 'stopSpeaking'
  | 'zoom'
  | 'front'
  | 'appMenu'
  | 'fileMenu'
  | 'editMenu'
  | 'viewMenu'
  | 'recentDocuments'
  | 'toggleTabBar'
  | 'selectNextTab'
  | 'selectPreviousTab'
  | 'mergeAllWindows'
  | 'clearRecentDocuments'
  | 'moveTabToNewWindow'
  | 'windowMenu';

/**
 * Events
 */
export type MenuEvent =
  | MenuStatusReqEvent
  | MenuStatusResEvent
  | MenuLoadReqEvent
  | MenuLoadResEvent
  | MenuItemClickedEvent;

/**
 * Retrieve the current status of the menu
 */
export type MenuStatusReqEvent = {
  type: 'runtime.electron/Menu/status:req';
  payload: MenuStatusReq;
};
export type MenuStatusReq = { tx?: string };

export type MenuStatusResEvent = {
  type: 'runtime.electron/Menu/status:res';
  payload: MenuStatusRes;
};
export type MenuStatusRes = {
  tx?: string;
  menu: Menu;
};

/**
 * Loads the menu.
 */
export type MenuLoadReqEvent = {
  type: 'runtime.electron/Menu/load:req';
  payload: MenuLoadReq;
};
export type MenuLoadReq = {
  tx?: string;
  menu: Menu;
};

export type MenuLoadResEvent = {
  type: 'runtime.electron/Menu/load:res';
  payload: MenuLoadRes;
};
export type MenuLoadRes = {
  tx: string;
  menu: Menu;
};

/**
 * Fires when a menu item is clicked.
 */

export type MenuItemClickedEvent = {
  type: 'runtime.electron/Menu/clicked';
  payload: MenuItemClicked;
};
export type MenuItemClicked = {
  id: string;
  item: MenuItem;
  parent?: MenuItem;
};
