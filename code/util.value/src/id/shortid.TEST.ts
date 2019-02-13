import { expect } from 'chai';

import { id } from '.';
import { R } from '../common';

describe('id.shortid', () => {
  it('creates a new short id', () => {
    const result = id.shortid();
    expect(result.length).to.be.greaterThan(5);
  });

  it('ids are unique', () => {
    const ids = Array.from({ length: 1000 }).map(() => id.shortid());
    expect(ids.length).to.eql(R.uniq(ids).length);
  });
});
