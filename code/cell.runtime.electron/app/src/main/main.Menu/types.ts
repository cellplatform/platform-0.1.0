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
export type MenuTreeVisitorArgs = {
  id: string;
  item: MenuItem;
  parent?: MenuItem;
  stop(): void;
};

/**
 * Menu Object
 */
export type Menu = MenuItem[];

export type MenuItem =
  | MenuItemNormal
  | MenuItemSubmenu
  | MenuItemCheckbox
  | MenuItemRadio
  | MenuItemSeperator;

type MenuItemBase = {
  id?: string;
  label?: string;
  sublabel?: string;
  accelerator?: string; // Shortcut key.
  visible?: boolean;
  enabled?: boolean;
  toolTip?: string;
  role?: MenuItemRole;
  click?: () => any;
  submenu?: Menu;
};

export type MenuItemNormal = MenuItemBase & { type: 'normal' };
export type MenuItemSubmenu = MenuItemBase & { type: 'submenu' };
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
export type MenuEvent = MenuLoadReqEvent | MenuLoadResEvent;

/**
 *
 */
export type MenuLoadReqEvent = {
  type: 'runtime.electron/Menu/load:req';
  payload: MenuLoadReq;
};
export type MenuLoadReq = {
  tx?: string;
  menu: MenuItem[];
};

export type MenuLoadResEvent = {
  type: 'runtime.electron/Menu/load:res';
  payload: MenuLoadRes;
};
export type MenuLoadRes = {
  tx: string;
  menu: MenuItem[];
};
