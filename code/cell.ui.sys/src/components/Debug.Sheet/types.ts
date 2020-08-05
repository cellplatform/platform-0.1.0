import { t } from '../../common';

export * from '../../common/types';

export type DebugSheetData = { selected?: string };
export type DebugSheetModule = t.IModule<DebugSheetData, DebugSheetEvent>;

/**
 * Events
 */

export type DebugSheetEvent = IFooEvent;

export type IFooEvent = { type: 'FOO/event'; payload: IFoo };
export type IFoo = { count: 123 };
