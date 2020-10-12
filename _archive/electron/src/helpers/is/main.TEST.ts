import { expect } from 'chai';
import { is } from './main';

describe('is (main)', () => {
  it('is not prod', () => {
    expect(is.prod).to.eql(false);
  });
});
