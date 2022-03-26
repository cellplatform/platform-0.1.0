import React from 'react';
import { Semver, SemverProps } from 'sys.ui.primitives/lib/ui/Semver';

import { useManifest } from '../useManifest';

type ManifestUrl = string;
export type ManifestSemverProps = SemverProps & { url?: ManifestUrl };

/**
 * The Semantic Version retrieved from a Module manifest.
 */
export const ManifestSemver: React.FC<ManifestSemverProps> = (props) => {
  const { url } = props;
  const manifest = useManifest({ url });
  const version = props.version ?? manifest.version;
  return <Semver {...props} version={version} />;
};
