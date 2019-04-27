export type NpmPrerelease = boolean | 'alpha' | 'beta';

export interface INpmInfo {
  name: string;
  latest: string;
  size: number;
  json: { [key: string]: any };
}

/**
 * `package.json`
 */
export type INpmPackageJson = {
  name?: string;
  description?: string;
  version?: string;
  main?: string;
  scripts?: INpmPackageFields;
  dependencies?: INpmPackageFields;
  devDependencies?: INpmPackageFields;
  peerDependencies?: INpmPackageFields;
  resolutions?: INpmPackageFields;
  license?: string;
};
export type INpmPackageFields = { [key: string]: string };
export type NpmPackageFieldsKey =
  | 'scripts'
  | 'dependencies'
  | 'devDependencies'
  | 'peerDependencies'
  | 'resolutions';
