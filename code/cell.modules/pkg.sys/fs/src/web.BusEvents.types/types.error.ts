type FilePath = string;

export type SysFsError = { code: SysFsErrorCode; message: string };
export type SysFsFileError = SysFsError & { path: string };

export type SysFsErrorCode =
  | 'client/timeout'
  | 'info'
  | 'read'
  | 'write'
  | 'delete'
  | 'copy'
  | 'move'
  | 'manifest'
  | 'cell/push'
  | 'cell/pull';
