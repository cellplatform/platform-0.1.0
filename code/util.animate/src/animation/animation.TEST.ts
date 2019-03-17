import { expect } from 'chai';
import { animation } from '.';

describe('animation', () => {
  it('exists', () => {
    expect(animation.start).to.be.an.instanceof(Function);
  });
});
