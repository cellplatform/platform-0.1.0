import { Compiler } from '.';
import { expect } from '../../test';

describe('Compiler', () => {
  it('static entry', () => {
    expect(typeof Compiler.bundle).to.eql('function');
    expect(typeof Compiler.config).to.eql('function');
    expect(typeof Compiler.devserver).to.eql('function');
    expect(typeof Compiler.watch).to.eql('function');
    expect(typeof Compiler.cell).to.eql('function');
  });

  it('create configuration', () => {
    const config = Compiler.config('myName');
    expect(config.toObject().name).to.eql('myName');
  });
});
