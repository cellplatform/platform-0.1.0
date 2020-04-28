import { t } from '../common';

/**
 * Typescript generator API.
 */
export type ITypeClientTypescript = {
  readonly header: string;
  readonly declaration: string;
  save(fs: t.IFs, path: string): Promise<{ path: string; text: string }>;
  toString(): string;
};
