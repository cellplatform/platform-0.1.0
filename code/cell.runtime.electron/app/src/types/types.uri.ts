import { t } from './common';

export type ElectronUri = ElectronMainUri | ElectronWindowUri;
export type ElectronMainUri = 'process:main';
export type ElectronWindowUri = string; // "process:window:<id>"

/**
 * Parsed URI objects.
 */
export type ElectronUriObject = ElectronWindowUriObject;

export type ElectronWindowUriObject = {
  ok: boolean;
  type: 'window';
  slug: string;
  errors: string[];
};
