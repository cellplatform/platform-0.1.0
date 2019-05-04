import { expect } from 'chai';
import { css } from '..';

describe('css.arrayToEdges', () => {
  it('undefined => undefined', () => {
    expect(css.arrayToEdges(undefined)).to.eql({});
  });

  it('null => undefined', () => {
    expect(css.arrayToEdges(null)).to.eql({});
  });

  it('[] => undefined', () => {
    expect(css.arrayToEdges([])).to.eql({});
  });

  it('"" => undefined', () => {
    expect(css.arrayToEdges('')).to.eql({});
    expect(css.arrayToEdges('  ')).to.eql({});
  });

  it('[null, null, null, null] => undefined', () => {
    expect(css.arrayToEdges([null, null, null, null])).to.eql({});
  });

  it('[null, null] => undefined', () => {
    expect(css.arrayToEdges([null, null])).to.eql({});
  });

  it('defaultValue', () => {
    const expected = { top: 10, right: 10, bottom: 10, left: 10 };
    expect(css.arrayToEdges(undefined, { defaultValue: 10 })).to.eql(expected);
    expect(css.arrayToEdges([], { defaultValue: 10 })).to.eql(expected);
    expect(css.arrayToEdges([null], { defaultValue: 10 })).to.eql(expected);
    expect(css.arrayToEdges([null, null], { defaultValue: 10 })).to.eql(expected);
  });

  it('"0 10px 6em 9%"', () => {
    expect(css.arrayToEdges('0 10px 6em 9%')).to.eql({
      top: 0,
      right: 10,
      bottom: '6em',
      left: '9%',
    });
  });

  it('"20px 5em"', () => {
    expect(css.arrayToEdges('20px 5em')).to.eql({
      top: 20,
      right: '5em',
      bottom: 20,
      left: '5em',
    });
  });

  it('10', () => {
    expect(css.arrayToEdges(10)).to.eql({
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    });
  });

  it('"10px"', () => {
    expect(css.arrayToEdges('10px')).to.eql({
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    });
  });

  it('"5em"', () => {
    expect(css.arrayToEdges('5em')).to.eql({
      top: '5em',
      right: '5em',
      bottom: '5em',
      left: '5em',
    });
  });

  it('[10, 20, 30, 40]', () => {
    expect(css.arrayToEdges([10, 20, 30, 40])).to.eql({
      top: 10,
      right: 20,
      bottom: 30,
      left: 40,
    });
  });

  it('[10, null, "30%", "40px"]', () => {
    expect(css.arrayToEdges([10, null, '30%', '40px'])).to.eql({
      top: 10,
      right: undefined,
      bottom: '30%',
      left: 40,
    });
  });

  it('[10, 20]', () => {
    expect(css.arrayToEdges([10, 20])).to.eql({
      top: 10,
      right: 20,
      bottom: 10,
      left: 20,
    });
  });

  it('[null, 20]', () => {
    expect(css.arrayToEdges([null, 20])).to.eql({
      top: undefined,
      right: 20,
      bottom: undefined,
      left: 20,
    });
  });

  it('[10, null]', () => {
    expect(css.arrayToEdges([10, null])).to.eql({
      top: 10,
      right: undefined,
      bottom: 10,
      left: undefined,
    });
  });
});

describe('toMargins', () => {
  it('none', () => {
    expect(css.toMargins()).to.eql({});
    expect(css.toMargins(null)).to.eql({});
  });

  it('all edges', () => {
    expect(css.toMargins(10)).to.eql({
      marginTop: 10,
      marginRight: 10,
      marginBottom: 10,
      marginLeft: 10,
    });
    expect(css.toMargins([10, 20, 30, 40])).to.eql({
      marginTop: 10,
      marginRight: 20,
      marginBottom: 30,
      marginLeft: 40,
    });
  });

  it('Y/X', () => {
    const res = css.toMargins([10, 20]);
    expect(res).to.eql({ marginTop: 10, marginRight: 20, marginBottom: 10, marginLeft: 20 });
  });

  it('defaultValue', () => {
    const expected = { marginTop: 10, marginRight: 10, marginBottom: 10, marginLeft: 10 };
    expect(css.toMargins(undefined, { defaultValue: 10 })).to.eql(expected);
    expect(css.toMargins([], { defaultValue: 10 })).to.eql(expected);
    expect(css.toMargins([null], { defaultValue: 10 })).to.eql(expected);
  });
});

describe('toPadding', () => {
  it('none', () => {
    expect(css.toPadding()).to.eql({});
    expect(css.toPadding(null)).to.eql({});
  });

  it('all edges', () => {
    expect(css.toPadding(10)).to.eql({
      paddingTop: 10,
      paddingRight: 10,
      paddingBottom: 10,
      paddingLeft: 10,
    });
    expect(css.toPadding([10, 20, 30, 40])).to.eql({
      paddingTop: 10,
      paddingRight: 20,
      paddingBottom: 30,
      paddingLeft: 40,
    });
  });

  it('Y/X', () => {
    const res = css.toPadding([10, 20]);
    expect(res).to.eql({ paddingTop: 10, paddingRight: 20, paddingBottom: 10, paddingLeft: 20 });
  });

  it('defaultValue', () => {
    const expected = { paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 10 };
    expect(css.toPadding(undefined, { defaultValue: 10 })).to.eql(expected);
    expect(css.toPadding([], { defaultValue: 10 })).to.eql(expected);
    expect(css.toPadding([null], { defaultValue: 10 })).to.eql(expected);
  });
});
