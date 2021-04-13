import { expect } from '../test';

import { LOREM, lorem } from './lorem';

describe('lorem (ipsum...)', () => {
  it('LOREM (constant)', () => {
    expect(LOREM.startsWith('Lorem ipsum dolor sit amet,')).to.eql(true);
    expect(LOREM.endsWith('Integer lacinia sapien at ante tempus volutpat.')).to.eql(true);
  });

  it('toString', () => {
    expect(lorem.toString()).to.equal(LOREM);
  });

  it('text', () => {
    expect(lorem.text).to.equal(LOREM);
  });

  it('words', () => {
    expect(lorem.words()).to.eql(LOREM);

    expect(lorem.words(-1)).to.eql('');
    expect(lorem.words(0)).to.eql('');

    expect(lorem.words(-1)).to.eql('', '.');
    expect(lorem.words(0)).to.eql('', '.');

    expect(lorem.words(1)).to.eql('Lorem');
    expect(lorem.words(5)).to.eql('Lorem ipsum dolor sit amet'); // NB: no trailing comma.
    expect(lorem.words(8)).to.eql('Lorem ipsum dolor sit amet, consectetur adipiscing elit'); // NB: no trailing period.

    expect(lorem.words(1, '.')).to.eql('Lorem.');
    expect(lorem.words(5, '.')).to.eql('Lorem ipsum dolor sit amet.');
    expect(lorem.words(8, '.')).to.eql('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
  });
});
