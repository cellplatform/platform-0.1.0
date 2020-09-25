import * as t from '../common/types';
import { IWindowProps } from '../components/Window';
import { ILayoutProps } from '../components/Body';

export type ShellView = 'Default' | 'Null' | '404';
export type ShellRegion = 'Tree' | 'Main' | 'Sidebar';
export type ShellData = { name: string };
export type ShellProps = t.IViewModuleProps<ShellData, ShellView, ShellRegion>;
export type ShellModule = t.IModule<ShellProps>;

export type Shell = {
  Body: (props?: ILayoutProps) => JSX.Element;
  Window: (props?: IWindowProps) => JSX.Element;
  module(bus: t.EventBus, options?: ShellOptions): ShellModule;
  builder(bus: t.EventBus, options?: { shell?: t.IModule }): t.IShellBuilder;
};

export type ShellOptions = {
  acceptNakedRegistrations?: boolean;
};

/**
 * [Callbacks]
 */
export type ShellLoadedCallbackHandler = (bus: t.EventBus) => void;
