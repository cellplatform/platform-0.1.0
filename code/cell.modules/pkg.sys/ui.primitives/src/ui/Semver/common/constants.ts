import { semver } from './libs';

const releaseTypes: semver.ReleaseType[] = [
  'major',
  'premajor',
  'minor',
  'preminor',
  'patch',
  'prepatch',
  'prerelease',
];

export const CONSTANTS = {
  default: '0.0.0',
  releaseTypes,
};
