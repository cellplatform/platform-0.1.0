import { t } from '../common';

export type RuntimeModule = {
  module: { name: string; version: string };
  origin?: t.RuntimeBundleOrigin;
};

export type RuntimeBundleOrigin = {
  host: string;
  uri: string;
  dir?: string;
  hash?: string; // Manifest hash (used for verification files have not been changed).
};
