import { expect } from 'chai';
import { yarn } from '.';
import { log } from '../common';

describe('yarn (integration)', () => {
  it.skip('getVersion', async () => {
    const res = await yarn.getVersion();
    expect(typeof res).to.eql('string');
    log.info('getVersion:', res);
  });
});
