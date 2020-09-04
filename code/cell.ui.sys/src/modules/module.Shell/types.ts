import { t } from '../../common';
export * from '../../common/types';
import { ILayoutProps } from './components/Layout';

export type ShellView = 'Default' | 'Null' | '404';
export type ShellTarget = 'Main' | 'Sidebar';
export type ShellData = { foo?: string | number };
export type ShellProps = t.IViewModuleProps<ShellData, ShellView, ShellTarget>;
export type ShellModule = t.IModule<ShellProps>;

export type ShellModuleDef = {
  Layout: (props?: ILayoutProps) => JSX.Element;
  module(bus: t.EventBus): ShellModule;
};
