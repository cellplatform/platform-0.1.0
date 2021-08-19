export type SysFsError = { code: SysFsErrorCode; message: string };
export type SysFsErrorCode =
  | 'client/timeout'
  | 'info'
  | 'read'
  | 'write'
  | 'delete'
  | 'copy'
  | 'move'
  | 'manifest';
