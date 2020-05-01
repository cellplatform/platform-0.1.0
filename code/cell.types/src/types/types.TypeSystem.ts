import { t } from '../common';

export * from './types.TypeSystem.ast';
export * from './types.TypeSystem.builder';
export * from './types.TypeSystem.cell';
export * from './types.TypeSystem.client';
export * from './types.TypeSystem.def';
export * from './types.TypeSystem.events';
export * from './types.TypeSystem.fetch';
export * from './types.TypeSystem.ns';
export * from './types.TypeSystem.ref';
export * from './types.TypeSystem.sheet';
export * from './types.TypeSystem.state';
export * from './types.TypeSystem.sync';

/**
 * Type Payload
 * (NB: can write directly to HTTP client )
 */
export type ITypeDefPayload = {
  ns?: t.INsProps;
  columns: t.IColumnMap;
};
