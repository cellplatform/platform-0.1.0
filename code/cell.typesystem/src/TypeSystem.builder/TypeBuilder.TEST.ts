import { expect, Uri } from '../test';
import { TypeBuilder } from '.';

describe.only('TypeBuilder', () => {
  it('create', () => {
    const builder = TypeBuilder.create();
    expect(builder).to.be.an.instanceof(TypeBuilder);
    expect(builder.toObject()).to.eql({}); // NB: empty.
  });

  describe('ns', () => {
    it('from string', () => {
      const builder = TypeBuilder.create();
      const ns = builder.ns('foo');
      expect(ns.uri.toString()).to.eql('ns:foo');
    });

    it('from object', () => {
      const builder = TypeBuilder.create();
      const uri = Uri.ns('foo');
      const ns = builder.ns(uri);
      expect(ns.uri.toString()).to.eql('ns:foo');
    });
  });
});
