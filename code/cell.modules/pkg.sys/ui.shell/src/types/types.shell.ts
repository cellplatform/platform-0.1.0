import * as t from '../common/types';
// import { IWindowProps } from './types.components';
// import { ILayoutProps } from '../components/Body';

export type ShellView = 'Default' | 'Null' | '404';
export type ShellRegion = 'Tree' | 'Main' | 'Sidebar';
export type ShellProps = t.IViewModuleProps<t.ShellData, ShellView, ShellRegion>;
export type ShellModule = t.IModule<ShellProps>;

export type Shell = {
  // Body: (props?: ILayoutProps) => JSX.Element;
  // Window: (props?: IWindowProps) => JSX.Element;
  module(bus: t.EventBus<any>, options?: ShellOptions): ShellModule;
  builder(bus: t.EventBus<any>, options?: { shell?: t.IModule }): t.IShellBuilder;
};

export type ShellOptions = {
  acceptNakedRegistrations?: boolean;
};

/**
 * [Callbacks]
 */
export type ShellLoadedCallbackHandler = (bus: t.EventBus) => void;
