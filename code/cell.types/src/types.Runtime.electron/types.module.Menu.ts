import { t } from './common';

type Milliseconds = number;

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
export type MenuId = string;
export type Menu = MenuItem[];

export type MenuItem = MenuItemNormal | MenuItemCheckbox | MenuItemRadio | MenuItemSeperator;

type MenuItemBase = {
  id?: MenuId;
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
export type MenuItemSeperator = { type: 'separator'; id?: MenuId };

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
 * Event API.
 */
export type MenuEvents = t.IDisposable & {
  $: t.Observable<MenuEvent>;
  is: { base(input: any): boolean };

  status: {
    req$: t.Observable<MenuStatusReq>;
    res$: t.Observable<MenuStatusRes>;
    get(options?: { timeout?: Milliseconds }): Promise<MenuStatusRes>;
  };

  load: {
    req$: t.Observable<MenuLoadReq>;
    res$: t.Observable<MenuLoadRes>;
    fire(menu: t.Menu, options?: { timeout?: Milliseconds }): Promise<MenuLoadRes>;
  };

  clicked: {
    $: t.Observable<MenuItemClicked>;
    fire(item: t.MenuItem, parent?: t.MenuItem): void;
  };

  patch: {
    req$: t.Observable<MenuPatchReq>;
    res$: t.Observable<MenuPatchRes>;
    fire(args: {
      id: t.MenuId;
      patches: t.PatchSet;
      timeout?: Milliseconds;
    }): Promise<MenuPatchRes>;
  };

  change<M extends MenuItem = MenuItemNormal>(
    id: t.MenuId,
    handler: MenuTypeChangeHandler<M>,
    options?: { timeout?: Milliseconds },
  ): Promise<MenuChangeRes>;
};

export type MenuTypeChangeHandler<M extends MenuItem> = (menu: M) => any | Promise<any>;

export type MenuChangeRes = {
  id: t.MenuId;
  menu: t.Menu;
  error?: string;
};

/**
 * Events
 */
export type MenuEvent =
  | MenuStatusReqEvent
  | MenuStatusResEvent
  | MenuLoadReqEvent
  | MenuLoadResEvent
  | MenuItemClickedEvent
  | MenuPatchReqEvent
  | MenuPatchResEvent;

/**
 * Retrieve the current status of the menu.
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
export type MenuStatusRes = { tx: string; menu: Menu; error?: string };

/**
 * Loads the menu.
 */
export type MenuLoadReqEvent = {
  type: 'runtime.electron/Menu/load:req';
  payload: MenuLoadReq;
};
export type MenuLoadReq = { tx?: string; menu: Menu };

export type MenuLoadResEvent = {
  type: 'runtime.electron/Menu/load:res';
  payload: MenuLoadRes;
};
export type MenuLoadRes = { tx: string; menu: Menu; elapsed: Milliseconds; error?: string };

/**
 * Fires when a menu item is clicked.
 */
export type MenuItemClickedEvent = {
  type: 'runtime.electron/Menu/clicked';
  payload: MenuItemClicked;
};
export type MenuItemClicked = { id: string; item: MenuItem; parent?: MenuItem };

/**
 * Fires a set of patch changes to apply to the menu.
 */
export type MenuPatchReqEvent = {
  type: 'runtime.electron/Menu/patch:req';
  payload: MenuPatchReq;
};
export type MenuPatchReq = { tx?: string; id: t.MenuId; patches: t.PatchSet; timeout: number };

export type MenuPatchResEvent = {
  type: 'runtime.electron/Menu/patch:res';
  payload: MenuPatchRes;
};
export type MenuPatchRes = {
  tx: string;
  id: t.MenuId; // of the changed item.
  menu: Menu;
  error?: string;
  elapsed: Milliseconds;
};
