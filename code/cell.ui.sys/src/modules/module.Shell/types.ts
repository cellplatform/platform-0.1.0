import { t } from '../../common';
export * from '../../common/types';
import { ILayoutProps } from './components/Layout';

export type ShellView = 'Default' | 'Null' | '404';
export type ShellRegion = 'Main' | 'Sidebar';
export type ShellData = { foo?: string | number };
export type ShellProps = t.IViewModuleProps<ShellData, ShellView, ShellRegion>;
export type ShellModule = t.IModule<ShellProps>;

export type ShellModuleDef = {
  Layout: (props?: ILayoutProps) => JSX.Element;
  module(bus: t.EventBus): ShellModule;
};

/**
 * Callbacks
 */
export type ShellLoadedCallbackHandler = (bus: t.EventBus) => void;
