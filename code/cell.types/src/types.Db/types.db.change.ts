export type IDbModelConflictStrategy = 'overwrite' | 'merge';

export type IDbModelChange = {
  uri: string;
  field: string;
  from?: any;
  to?: any;
};
