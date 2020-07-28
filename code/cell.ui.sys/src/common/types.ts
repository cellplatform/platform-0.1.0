import * as t from '../types';

export * from '@platform/types';
export * from '@platform/cell.types';
export * from '@platform/cell.schema.sys/lib/types';
export * from '@platform/cell.ui/lib/types';
export * from '@platform/state/lib/types';
export * from '@platform/ui.text/lib/types';
export * from '@platform/ui.button/lib/types';
export * from '@platform/ui.tree/lib/types';

export * from '../types';

export type RenderOverlay = (overlay: t.IAppStateOverlay) => React.ReactNode;
export type Object = Record<string, unknown>;

export type Entry = 'entry:builder' | 'entry:debug' | 'entry:debug.sheet';
