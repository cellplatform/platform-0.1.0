import { expect } from 'chai';
import * as state from '..';

describe('state (module)', () => {
  it('exports the `createStore` function.', () => {
    expect(state.createStore).to.be.an.instanceof(Function);
  });
});
