import React from 'react';

import { t, WebRuntime } from '../../common';
import { Layout } from './Layout';

const { useManifest } = WebRuntime.ui;

type ManifestUrl = string;
export type SemverManifestProps = t.SemverProps & { url?: ManifestUrl };

/**
 * The Semantic Version retrieved from a Module manifest.
 */
export const SemverManifest: React.FC<SemverManifestProps> = (props) => {
  const { url } = props;
  const manifest = useManifest({ url });
  const version = props.version ?? manifest.version;
  return <Layout {...props} version={version} />;
};
