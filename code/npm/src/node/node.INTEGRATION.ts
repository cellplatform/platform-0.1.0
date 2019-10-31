import { expect } from 'chai';
import { node } from '.';
import { log } from '../common';

describe('node (integration)', () => {
  it.skip('getVersion', async () => {
    const res = await node.getVersion();
    expect(typeof res).to.eql('string');
    expect(res && res.startsWith('v')).to.eql(false);
    log.info('node.getVersion:', res);
  });
});
