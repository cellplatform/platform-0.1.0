import { Test, expect } from '../../test';
import { Module } from '.';

export default Test.describe('Module', (e) => {
  e.it('has URL helpers', () => {
    const res = Module.Url.parseUrl('https://domain.com/', { entry: 'sys.foo' });

    expect(res.entry).to.eql('./sys.foo');
    expect(res.manifest).to.eql('https://domain.com/index.json');
    expect(res.href).to.eql('https://domain.com/index.json?entry=.%2Fsys.foo');
    expect(res.error).to.eql(undefined);
  });
});
