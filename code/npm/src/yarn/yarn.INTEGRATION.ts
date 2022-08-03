import { expect, log } from '../test';
import { yarn } from '.';

describe('yarn (integration)', () => {
  it.skip('getVersion', async () => {
    const res = await yarn.getVersion();
    expect(typeof res).to.eql('string');
    log.info('yarn.getVersion:', res);
  });
});
