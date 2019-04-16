// tslint:disable
import { expect } from 'chai';
import * as str from '.';

describe('str.matchAll (regex)', () => {
  it('direct invoke', () => {
    const res = str.matchAll(/\$\{.*?\}/, 'hello ${NAME}. ${AGE}.');
    expect(res.length).to.eql(2);

    expect(res[0].match).to.eql('${NAME}');
    expect(res[0].index).to.eql(6);

    expect(res[1].match).to.eql('${AGE}');
    expect(res[1].index).to.eql(15);
  });

  it('curried', () => {
    const matcher = str.matchAll(/\$\{.*?\}/);
    const input = 'hello ${NAME}. ${AGE}';
    const res = matcher(input);

    expect(res.length).to.eql(2);

    expect(res[0].match).to.eql('${NAME}');
    expect(res[0].index).to.eql(6);

    expect(res[1].match).to.eql('${AGE}');
    expect(res[1].index).to.eql(15);
  });

  it('finds all (global)', () => {
    const res = str.matchAll(/\$\{.*?\}/g, 'hello ${NAME}. ${AGE}.');
    expect(res.length).to.eql(2);
  });

  it('no match', () => {
    const res = str.matchAll(/\$\{.*?\}/g, 'FOO');
    expect(res.length).to.eql(0);
  });

  it('case-sensitive (default)', () => {
    const res = str.matchAll(/Bob/, 'bob-1 BOB-2 bOb-3 Bob1-4');
    expect(res.length).to.eql(1);
    expect(res[0].index).to.eql(18);
  });

  it('not case-sensitive (ignore case)', () => {
    const res = str.matchAll(/Bob/i, 'bob-1 BOB-2 bOb-3 Bob1-4');
    expect(res.length).to.eql(4);
    expect(res[0].index).to.eql(0);
    expect(res[1].index).to.eql(6);
    expect(res[2].index).to.eql(12);
    expect(res[3].index).to.eql(18);
  });
});
