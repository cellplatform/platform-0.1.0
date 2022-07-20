import { WebRuntime as Base } from 'sys.runtime.web';

import { HttpCache } from './Web.HttpCache';

import { useManifest, useModuleTarget } from './ui/hooks';
import { ManifestSelector, ManifestSelectorStateful } from './ui/Manifest.Selector';
import { ManifestSemver } from './ui/Manifest.Semver';
import { Module } from './ui/Module';
import { ModuleInfo } from './ui/Module.Info';

export const UI = {
  useManifest,
  useModuleTarget,
  ManifestSelector,
  ManifestSelectorStateful,
  ManifestSemver,
  Module,
  ModuleInfo,
};

export const WebRuntime = {
  ...Base,
  UI,

  /**
   * TODO 🐷 move to [sys.runtime.web]
   */
  HttpCache,
};
