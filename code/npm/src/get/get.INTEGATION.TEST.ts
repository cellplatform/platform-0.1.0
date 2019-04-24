import { expect } from 'chai';
import { npm } from '..';
import { log } from '../common';

describe('util.npm (integration)', function() {
  this.timeout(20000);

  it.skip('getInfo', async () => {
    const res = await npm.getInfo('create-tmpl');
    log.info('getInfo:', res);
  });

  it.skip('getInfo: @uiharness/electron', async () => {
    const res = await npm.getInfo('@uiharness/electron');
    log.info('getInfo:', res);
  });

  it.skip('getVersion', async () => {
    const res = await npm.getVersion('create-tmpl');
    log.info('getVersion:', res);
  });

  it.skip('getVersions (object)', async () => {
    const deps = { react: '^x', 'react-dom': 'x' };
    const res = await npm.getVersions(deps);
    expect(res).to.not.equal(deps);
    log.info(res);
  });

  it.skip('getVersions (array)', async () => {
    const modules = ['react', 'react-dom'];
    const res = await npm.getVersions(modules);
    expect(res).to.not.equal(modules);
    log.info(res);
  });

  it.skip('getVersion: prerelease', async () => {
    const res = await npm.getVersion('@tdb/slc.graphql', { prerelease: true });
    log.info('getVersion:', res);
  });

  it.skip('getVersions: prerelease', async () => {
    const res = await npm.getVersions(['@tdb/slc.graphql'], { prerelease: false });
    log.info('getVersions:', res);
  });
});
