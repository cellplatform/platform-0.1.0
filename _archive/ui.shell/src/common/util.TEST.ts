import { expect } from 'chai';

import { t } from '.';
import * as util from './util';

describe('util.toColor', () => {
  it('object', () => {
    const res = util.toColor({ color: '#abc', fadeSpeed: 123 }, { color: '#fff', fadeSpeed: 300 });
    expect(res.color).to.eql('#abc');
    expect(res.fadeSpeed).to.eql(123);
  });

  it('string: named color', () => {
    const res = util.toColor('red', { color: '#fff', fadeSpeed: 300 });
    expect(res.color).to.eql('red');
    expect(res.fadeSpeed).to.eql(300);
  });

  it('string: hex', () => {
    const res = util.toColor('#abc', { color: '#fff', fadeSpeed: 300 });
    expect(res.color).to.eql('#abc');
    expect(res.fadeSpeed).to.eql(300);
  });

  it('transparent', () => {
    const test = (input: t.IShellColor | string | number) => {
      const res = util.toColor(input, { color: '#fff', fadeSpeed: 300 });
      expect(res.color).to.eql('transparent');
    };
    test(0);
    test('rgba(0, 0, 0, 0.0)');
    test({ color: 'rgba(0, 0, 0, 0.0)', fadeSpeed: 300 });
  });
});
