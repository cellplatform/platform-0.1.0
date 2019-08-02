import { expect } from '../test';
import { Schema } from '.';

describe('schema', () => {
  it('has version', () => {
    const schema = Schema.create();
    expect(schema.version).to.eql('v2');
  });

  it('ORG (specific)', () => {
    const schema = Schema.create();
    const res = schema.org('123');
    expect(res).to.eql('v2/ORG/123');
  });

  it('ORG (generic)', () => {
    const schema = Schema.create();
    const res = schema.org();
    expect(res).to.eql('v2/ORG/*');
  });
});
