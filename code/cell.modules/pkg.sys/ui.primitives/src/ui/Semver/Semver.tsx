import React from 'react';

import { FC, t, WebRuntime } from '../common';
import { Layout } from './Layout';

export { SemverProps } from './types';
import { SemverManifest as Manifest, SemverManifestProps } from './Semver.Manifest';

const { useManifest } = WebRuntime.ui;

/**
 * Component
 */
const View: React.FC<t.SemverProps> = (props) => <Layout {...props} />;

/**
 * Export
 */
type Fields = {
  useManifest: t.UseManifestHook;
  Manifest: React.FC<SemverManifestProps>;
};
export const Semver = FC.decorate<t.SemverProps, Fields>(
  View,
  { useManifest, Manifest },
  { displayName: 'Semver' },
);
