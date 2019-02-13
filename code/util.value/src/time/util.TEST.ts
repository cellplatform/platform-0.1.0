import { expect } from 'chai';
import { time } from '.';

describe('toTimestamp', () => {
  it('returns a timestamp when no date is passed', () => {
    const now = time.toTimestamp(new Date());
    expect(time.toTimestamp()).to.eql(now);
  });

  it('returns a timestamp from the given date', () => {
    const date = new Date('Thu Mar 22 2018 14:35:10 GMT+1300 (NZDT)');
    const timestamp = time.toTimestamp(date);
    expect(timestamp).to.be.a('number');
    expect(timestamp).to.eql(time.toTimestamp(date));
    expect(timestamp).to.eql(time.day(date).unix());
  });
});

describe('fromTimestamp', () => {
  it('converts timestamp number into a Date', () => {
    const date = new Date('Thu Mar 22 2018 14:35:10 GMT+1300 (NZDT)');
    const timestamp = time.toTimestamp(date);
    const res = time.fromTimestamp(timestamp);
    expect(res.toISOString()).to.eql('2018-03-22T01:35:10.000Z');
  });
});
