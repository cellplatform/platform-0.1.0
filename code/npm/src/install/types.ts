import * as t from '../common/types';

export type INpmInstallResult = {
  elapsed: number;
  success: boolean;
  code: number;
  dir: string;
  engine: t.Engine;
  info: string[];
  errors: string[];
};

export type INpmInstallEvent = {
  type: 'INFO' | 'ERROR' | 'COMPLETE';
  result: INpmInstallResult;
  info?: string;
  error?: string;
};
