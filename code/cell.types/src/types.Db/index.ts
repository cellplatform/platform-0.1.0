export * from './types.db.ns';
export * from './types.db.cell';
export * from './types.db.file';

export type IDbModelConflictAction = 'overwrite' | 'merge';

export type IDbModelChange = {
  uri: string;
  field: string;
  from?: any;
  to?: any;
};
