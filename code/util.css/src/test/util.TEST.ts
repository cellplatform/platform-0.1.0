import { expect } from 'chai';
import { css } from '..';

describe('css.arrayToEdges', () => {
  it('undefined => undefined', () => {
    expect(css.arrayToEdges(undefined)).to.eql(undefined);
  });

  it('null => undefined', () => {
    expect(css.arrayToEdges(null)).to.eql(undefined);
  });

  it('[] => undefined', () => {
    expect(css.arrayToEdges([])).to.eql(undefined);
  });

  it('"" => undefined', () => {
    expect(css.arrayToEdges('')).to.eql(undefined);
    expect(css.arrayToEdges('  ')).to.eql(undefined);
  });

  it('[null, null, null, null] => undefined', () => {
    expect(css.arrayToEdges([null, null, null, null])).to.eql(undefined);
  });

  it('[null, null] => undefined', () => {
    expect(css.arrayToEdges([null, null])).to.eql(undefined);
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
