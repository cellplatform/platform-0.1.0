import { expect } from 'chai';
import { style } from '..';

describe('Flex', () => {
  it('does not fail when undefined is passed', () => {
    const result = style.transform({
      Flex: undefined,
    });
    expect(result).to.eql({});
  });

  it('does not fail when false is passed', () => {
    const result = style.transform({
      Flex: false,
    });
    expect(result).to.eql({});
  });
});
