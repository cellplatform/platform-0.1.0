export * from '../types';

export * from '@platform/types';
export * from '@platform/cell.types';
export * from '@platform/state.types';
export * from '@platform/ui.tree/lib/types';

export type Object = Record<string, unknown>;

import { IWindowTitlebarProps } from '@platform/cell.ui/lib/components/WindowTitlebar';
export { IWindowTitlebarProps };
export type ShellTheme = IWindowTitlebarProps['theme'];
