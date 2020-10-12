import { Webpack } from '.';
import { expect } from '../test';

describe('Module (Webpack)', () => {
  it('static', () => {
    expect(typeof Webpack.bundle).to.eql('function');
    expect(typeof Webpack.config.create).to.eql('function');
    expect(typeof Webpack.dev).to.eql('function');
    expect(typeof Webpack.upload).to.eql('function');
    expect(typeof Webpack.watch).to.eql('function');
  });
});
