import { exec, fs, semver } from './common';
import { getVersion, getVersionHistory, getVersions } from './get';
import { install } from './install';
import { NpmPackage, pkg } from './pkg';
import { prompt } from './prompt';
import { yarn } from './yarn';

export const Npm = {
  NpmPackage,
  pkg,
  yarn,
  prompt,

  install,
  getVersion,
  getVersionHistory,
  getVersions,

  /**
   * Convenience methods:
   */
  fs,
  semver,
  exec,
};
