import React from 'react';
import { Semver, SemverProps } from 'sys.ui.primitives/lib/ui/Semver';

import { useManifest } from '../useManifest';
import { t } from '../common';

type ManifestUrl = string;

export type ManifestSemverProps = SemverProps & {
  url?: ManifestUrl;
  onLoaded?: t.ManifestHookLoadedHandler;
};

/**
 * The Semantic Version retrieved from a Module manifest.
 */
export const ManifestSemver: React.FC<ManifestSemverProps> = (props) => {
  const { url, onLoaded } = props;
  const manifest = useManifest({ url, onLoaded });
  const version = props.version ?? manifest.version;
  const tooltip = props.tooltip ?? toTooltip(manifest.json);
  return <Semver {...props} version={version} tooltip={tooltip} />;
};

/**
 * [Helpers]
 */

function toTooltip(manifest?: t.ModuleManifest) {
  if (!manifest) return;
  const { namespace, version } = manifest.module;
  return `${namespace}@${version}`;
}
