import { expect } from 'chai';
import { Argv } from '.';

describe('argument parsing', () => {
  it('simple string args', () => {
    const res = Argv.parse('  foo  bar  ');
    expect(res.params).to.eql(['foo', 'bar']);
    expect(res.options).to.eql({});
  });

  it('typed [params]', () => {
    const res = Argv.parse(' .123  true  false    text  ');
    expect(res.params[0]).to.eql(0.123);
    expect(res.params[1]).to.eql(true);
    expect(res.params[2]).to.eql(false);
    expect(res.params[3]).to.eql('text');
  });

  it('[options] only - set of flags', () => {
    type Foo = { f: boolean; n: boolean; a: boolean };
    const res = Argv.parse<Foo>('-fna');
    expect(res.params).to.eql([]);
    expect(res.options).to.eql({ f: true, n: true, a: true });
    expect(res.options.f).to.eql(true);
    expect(res.options.n).to.eql(true);
    expect(res.options.a).to.eql(true);
  });

  it('[option] value types', () => {
    const res = Argv.parse('--count 123 --text=hello --no=false --yes=true --json={foo:123}');
    expect(res.options.count).to.eql(123);
    expect(res.options.text).to.eql('hello');
    expect(res.options.no).to.eql(false);
    expect(res.options.yes).to.eql(true);
    expect(res.options.json).to.eql('{foo:123}');
  });
});
