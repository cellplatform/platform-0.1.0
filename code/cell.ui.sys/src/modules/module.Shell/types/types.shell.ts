import * as t from '../common/types';
import { IWindowProps } from '../components/Window';
import { ILayoutProps } from '../components/Body';

import { ShellBuilder } from '../language';

export type ShellView = 'Default' | 'Null' | '404';
export type ShellRegion = 'Tree' | 'Main' | 'Sidebar';
export type ShellData = { foo?: string | number };
export type ShellProps = t.IViewModuleProps<ShellData, ShellView, ShellRegion>;
export type ShellModule = t.IModule<ShellProps>;

export type Shell = {
  Body: (props?: ILayoutProps) => JSX.Element;
  Window: (props?: IWindowProps) => JSX.Element;
  module(bus: t.EventBus, options?: ShellOptions): ShellModule;

  builder: typeof ShellBuilder.builder; // TEMP 🐷
};

export type ShellOptions = {
  acceptNakedRegistrations?: boolean;
};

/**
 * [Callbacks]
 */
export type ShellLoadedCallbackHandler = (bus: t.EventBus) => void;
