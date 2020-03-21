import { expect } from '../test';
import { RefSchema, RefLinks } from '.';
import { Schema } from '../Schema';

describe('RefSchema', () => {
  it('exposed from Schema (static)', () => {
    expect(Schema.ref).to.equal(RefSchema);
    expect(Schema.ref.links).to.equal(RefLinks);
  });
});
