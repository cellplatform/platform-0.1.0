import { NpmPackage, INpmPackageInit } from './NpmPackage';

export * from './NpmPackage';

/**
 * Creates a new [NpmPackage] for the given directory.
 */
export const pkg = (input?: string | INpmPackageInit) => NpmPackage.create(input);
