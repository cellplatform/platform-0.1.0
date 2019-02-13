import { expect } from 'chai';
import { is } from '.';

describe('is', () => {
  it('test', () => {
    expect(is.nodeEnv).to.eql('test');
    expect(is.test).to.eql(true);
  });

  it('browser', () => {
    expect(is.browser).to.eql(false);
  });
});
