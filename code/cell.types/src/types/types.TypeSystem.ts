import { t } from '../common';

export * from './types.TypeSystem.ast';
export * from './types.TypeSystem.cell';
export * from './types.TypeSystem.def';
export * from './types.TypeSystem.events';
export * from './types.TypeSystem.fetch';
export * from './types.TypeSystem.sheet';
export * from './types.TypeSystem.state';

/**
 * The type declaration for the namespace/sheet.
 */
export type INsType = {
  implements?: string; //   URI of another namespace containing the type definition to conform to.
};

/**
 * Type Payload
 * (NB: can write directly to HTTP client )
 */
export type ITypeDefPayload = {
  ns?: t.INsProps;
  columns: t.IColumnMap;
};
