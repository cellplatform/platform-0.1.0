import { t } from './common';

export type ElectronUri = ElectronProcessUri;

export type ElectronProcessUri = ElectronProcessMainUri | ElectronProcessWindowUri;
export type ElectronProcessMainUri = 'process:main';
export type ElectronProcessWindowUri = string; // format: "process:window:<id>"

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
