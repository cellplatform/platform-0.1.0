import { expect } from 'chai';
import { Argv } from '.';

describe('argument parsing', () => {
  it('simple string command args', () => {
    const res = Argv.parse('  foo  bar  ');
    expect(res.commands).to.eql(['foo', 'bar']);
    expect(res.params).to.eql({});
  });

  it('typed command values', () => {
    const res = Argv.parse(' .123  true  false    text  ');
    expect(res.commands[0]).to.eql(0.123);
    expect(res.commands[1]).to.eql(true);
    expect(res.commands[2]).to.eql(false);
    expect(res.commands[3]).to.eql('text');
  });

  it('params only', () => {
    type Foo = { f: boolean; n: boolean; a: boolean };
    const res = Argv.parse<Foo>('-fna');
    expect(res.commands).to.eql([]);
    expect(res.params).to.eql({ f: true, n: true, a: true });
    expect(res.params.f).to.eql(true);
    expect(res.params.n).to.eql(true);
    expect(res.params.a).to.eql(true);
  });

  it('param types', () => {
    const res = Argv.parse('--count 123 --text=hello --no=false --yes=true --json={foo:123}');
    expect(res.params.count).to.eql(123);
    expect(res.params.text).to.eql('hello');
    expect(res.params.no).to.eql(false);
    expect(res.params.yes).to.eql(true);
    expect(res.params.json).to.eql('{foo:123}');
  });
});
