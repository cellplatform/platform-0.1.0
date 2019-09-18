import { expect } from 'chai';
import { hash } from './util.hash';

describe('hash', () => {
  it('hashes values', () => {
    expect(hash(undefined)).to.eql('67cbf865735ab20856e1e6649eab1c4073bc341e'); // NB: converted to "".
    expect(hash('')).to.eql('67cbf865735ab20856e1e6649eab1c4073bc341e');

    expect(hash(null)).to.eql('109085beaaa80ac89858b283a64f7c75d7e5bb12');
    expect(hash('hello')).to.eql('f3584f1b4c5b81a19f1849be114ddbc532dc77f7');

    expect(hash(1)).to.eql('7b343448ed87b254b79eba27bc18c21b2f985f0c');
    expect(hash(123)).to.eql('7d37103e1c4d22de8f7b4096b4be8c2ddfa4caa0');
    expect(hash(true)).to.eql('cdf22d2a18b96ef07f6105cd8093ae12a8772cb3');
    expect(hash(false)).to.eql('b29c63990dea846689120516761de20c056e3539');

    expect(hash({})).to.eql('323217f643c3e3f1fe7532e72ac01bb0748c97be');
    expect(hash({ foo: 123 })).to.eql('de547cb0e4f1b91fd1660e1e590346ddc52ad8de');

    expect(hash([])).to.eql('989db2448f309bfdd99b513f37c84b8f5794d2b5');
    expect(hash([1, 'two', { item: 3 }])).to.eql('69f71c1cb17fcd8f35cd413fb0b446d8fa5898cd');
  });
});
