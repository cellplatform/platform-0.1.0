import { expect } from 'chai';

import { id } from '.';
import { R } from '../common';

describe('id.cuid', () => {
  it('creates a new CUID', () => {
    const result = id.cuid();
    expect(result.length).to.be.greaterThan(24);
  });

  it('ids are unique', () => {
    const ids = Array.from({ length: 1000 }).map(() => id.cuid());
    expect(ids.length).to.eql(R.uniq(ids).length);
  });
});
