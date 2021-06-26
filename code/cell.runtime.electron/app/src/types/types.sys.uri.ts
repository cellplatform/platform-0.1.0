import { t } from './common';

export type RuntimeUri = ProcessUri;

export type ProcessUri = ProcessMainUri | ProcessWindowUri;
export type ProcessMainUri = 'process:main';
export type ProcessWindowUri = string; // format: "process:window:<id>" (renderer)

/**
 * Parsed URI objects.
 */
export type RuntimeUriObject = WindowUriObject;
export type WindowUriObject = {
  ok: boolean;
  type: 'window';
  slug: string;
  errors: string[];
};
