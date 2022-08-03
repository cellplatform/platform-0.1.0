import { expect, log, Npm } from '../test';
import * as dotenv from 'dotenv';

dotenv.config();
const NPM_TOKEN = process.env.NPM_TOKEN_TEST;

/**
 * For calls to private modules, pass the NPM_TOKEN
 * and ensure there is a `.npmrc` file within the project
 * containing:
 *
 *    `//registry.npmjs.org/:_authToken=${NPM_TOKEN}`
 *
 */
describe('util.npm (integration)', function () {
  this.timeout(20000);

  it.skip('getVersion (private module)', async () => {
    const res = await Npm.getVersion('@tdb/slc.graphql', { NPM_TOKEN });
    log.info('getVersion:', res);
  });

  it('getVersion', async () => {
    const res = await Npm.getVersion('create-tmpl');
    log.info('getVersion:', res);
  });

  it.skip('getVersions (object)', async () => {
    const deps = { react: '^x', 'react-dom': 'x' };
    const res = await Npm.getVersions(deps);
    expect(res).to.not.equal(deps);
    log.info(res);
  });

  it.skip('getVersions (array)', async () => {
    const modules = ['react', 'react-dom'];
    const res = await Npm.getVersions(modules);
    expect(res).to.not.equal(modules);
    log.info(res);
  });

  it.skip('getVersion: prerelease', async () => {
    const res = await Npm.getVersion('@tdb/slc.graphql', { prerelease: true });
    log.info('getVersion:', res);
  });

  it.skip('getVersions: prerelease', async () => {
    const res = await Npm.getVersions(['@tdb/slc.graphql'], { prerelease: false });
    log.info('getVersions:', res);
  });

  it.skip('getVersionHistory', async () => {
    const res = await Npm.getVersionHistory('@tdb/slc.graphql', { prerelease: true });
    log.info('getVersionHistory:', res);
  });
});
