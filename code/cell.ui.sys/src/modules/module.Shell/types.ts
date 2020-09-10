import { t } from '../../common';
export * from '../../common/types';
import { IWindowProps } from './components/Window';
import { ILayoutProps } from './components/Body';

export type ShellView = 'Default' | 'Null' | '404';
export type ShellRegion = 'Tree' | 'Main' | 'Sidebar';
export type ShellData = { foo?: string | number };
export type ShellProps = t.IViewModuleProps<ShellData, ShellView, ShellRegion>;
export type ShellModule = t.IModule<ShellProps>;

export type ShellModuleDef = {
  Body: (props?: ILayoutProps) => JSX.Element;
  Window: (props?: IWindowProps) => JSX.Element;
  module(bus: t.EventBus, options?: ShellModuleDefOptions): ShellModule;
};

export type ShellModuleDefOptions = {
  acceptNakedRegistrations?: boolean;
};

/**
 * [Callbacks]
 */
export type ShellLoadedCallbackHandler = (bus: t.EventBus) => void;

/**
 * [Events]
 */
export type ShellEvent = IShellFocusEvent;

export type IShellFocusEvent = {
  type: 'Shell/focus';
  payload: IShellFocus;
};
export type IShellFocus = {
  region: ShellRegion;
};
