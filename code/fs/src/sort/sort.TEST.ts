import { expect } from 'chai';
import { fs } from '..';

describe('sort (filenames)', () => {
  it('return sorted filenames (as new instance)', () => {
    const input = ['aaa', '111', 'zzz', '_zzz', '11 10', '1110', 'a0', '9'];
    const sorted = ['_zzz', '9', '11 10', '111', '1110', 'a0', 'aaa', 'zzz'];
    const res = fs.sort.paths(input);
    expect(res).to.eql(sorted);
    expect(res).to.not.equal(input);
  });

  it('sorts paths', () => {
    const input = [
      'z',
      'a',
      '/Z',
      '/z',
      '/x/y1/z',
      '/x/y0/z',
      '/x/y__/z',
      '/x/y/x',
      '/x/y/a',
      '/A/E/g/6',
      '/A/e/g/3',
      '/A',
      '/a/D/f/5',
      '/a/d/f/1',
      '/a',
    ];
    const res = fs.sort.paths(input);
    expect(res).to.eql(input.reverse());
  });

  it('sorts filename-number suffix (eg "file9.png", "file10.png")', () => {
    const input = Array.from({ length: 200 }).map((v, i) => `file${i}.png`);
    const res = fs.sort.paths([...input].reverse());
    expect(res).to.eql(input);
  });

  it('sort by object field-name', async () => {
    const input = [{ name: 'kitty10.jpg' }, { name: 'kitty9.png' }, { name: 'kitty0.png' }];
    const res = fs.sort.objects(input, item => item.name);
    expect(res.map(o => o.name)).to.eql(['kitty0.png', 'kitty9.png', 'kitty10.jpg']);
  });
});
