import { expect, Uri } from '../test';
import { TypeBuilder } from '.';
import { TypeBuilderNs } from './TypeBuilderNs';

describe.only('TypeBuilder', () => {
  it('create', () => {
    const builder = TypeBuilder.create();
    expect(builder).to.be.an.instanceof(TypeBuilder);
    expect(builder.toObject()).to.eql({}); // NB: empty.
  });

  describe('ns', () => {
    it('from string', () => {
      const ns = TypeBuilder.create().ns('foo');
      expect(ns).to.be.an.instanceof(TypeBuilderNs);
      expect(ns.uri.toString()).to.eql('ns:foo');
    });

    it('from object', () => {
      const uri = Uri.ns('foo');
      const ns = TypeBuilder.create().ns(uri);
      expect(ns).to.be.an.instanceof(TypeBuilderNs);
      expect(ns.uri.toString()).to.eql('ns:foo');
    });
  });
});
