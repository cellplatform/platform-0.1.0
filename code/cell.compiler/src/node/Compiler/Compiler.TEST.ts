import { Compiler } from '.';
import { expect } from '../../test';

describe('Compiler', () => {
  it('static entry', () => {
    expect(typeof Compiler.bundle).to.eql('function');
    expect(typeof Compiler.config).to.eql('function');
    expect(typeof Compiler.dev).to.eql('function');
    expect(typeof Compiler.upload).to.eql('function');
    expect(typeof Compiler.watch).to.eql('function');
    expect(typeof Compiler.cell).to.eql('function');
  });

  it('create "base" configuration (default)', () => {
    const config = Compiler.config();
    expect(config.toObject().name).to.eql('base');
  });
});
