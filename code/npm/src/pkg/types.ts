export { INpmPackageJson } from '../types';

export type INpmInfo = {
  name: string;
  latest: string;
  json: { [key: string]: any };
};

export type INpmPackageFields = { [key: string]: string };
export type NpmPackageFieldsKey = 'scripts' | 'resolutions' | NpmDepenciesFieldKey;

export type NpmDepenciesFieldKey = 'dependencies' | 'devDependencies' | 'peerDependencies';
