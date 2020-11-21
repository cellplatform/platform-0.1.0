import { t } from '../common';

export type RuntimeBundle = {
  module: { name: string; version: string };
  origin?: t.RuntimeBundleOrigin;
};

export type RuntimeBundleOrigin = {
  host: string;
  cell: string;
  dir?: string;
};
