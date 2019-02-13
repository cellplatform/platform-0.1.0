import { expect } from 'chai';
import * as str from '.';

describe('convert', () => {
  it('converts using `string` utility', () => {
    const res = str.convert.dasherize('helloThere');
    expect(res).to.equal('hello-there');
  });
});
