import { t } from '../common';

/**
 * Typescript generator.
 */
export type ITypeClientTypescript = {
  readonly header: string;
  readonly declaration: string;
  save(fs: t.INodeFs, path: string): Promise<{ path: string; text: string }>;
  toString(options?: { path?: string }): string;
};

export type ITypeClientTypescriptOptions = {
  header?: boolean;
  exports?: boolean;
  imports?: boolean;
};
