export * from './install/types';

/**
 * Types
 */
export type Engine = 'YARN' | 'NPM';
export type NpmPrerelease = boolean | 'alpha' | 'beta';

/**
 * NPM [package.json] file.
 */
export { NpmPackageJson, NpmPackageFields, NpmPackageFieldsKey } from '@platform/types';
