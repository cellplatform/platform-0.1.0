import { expect } from '../test';
import { RefSchema, RefLinks } from '.';
import { Schema } from '../Schema';

describe('RefSchema', () => {
  it('exposed from Schema (static)', () => {
    expect(Schema.Ref).to.equal(RefSchema);
    expect(Schema.Ref.Links).to.equal(RefLinks);
  });
});
