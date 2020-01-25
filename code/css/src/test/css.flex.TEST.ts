import { expect } from 'chai';
import { transform } from '../css/css';

describe('Flex', () => {
  it('does not fail when undefined is passed', () => {
    const result = transform({
      Flex: undefined,
    });
    expect(result).to.eql({});
  });

  it('does not fail when false is passed', () => {
    const result = transform({
      Flex: false,
    });
    expect(result).to.eql({});
  });
});
