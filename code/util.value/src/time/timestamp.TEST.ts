import { expect } from 'chai';
import { time } from '.';

// import * as t from './timestamp';

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
    expect(timestamp).to.eql(date.getTime());
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

describe('time.utc', () => {
  it('now', () => {
    const utc = time.utc();
    expect(utc.date).to.eql(time.fromTimestamp(utc.timestamp));
    expect(utc.timestamp).to.eql(time.toTimestamp(utc.date));
    expect(utc.unix).to.eql(time.day(utc.date).unix());
  });

  it('from timestamp', () => {
    const now = time.toTimestamp(new Date());
    const utc = time.utc();
    expect(utc.date).to.eql(time.fromTimestamp(now));
    expect(utc.timestamp).to.eql(now);
    expect(utc.unix).to.eql(time.day(now).unix());
  });

  it('from date', () => {
    const now = new Date();
    const utc = time.utc(now);
    expect(utc.date).to.eql(now);
    expect(utc.timestamp).to.eql(time.toTimestamp(now));
    expect(utc.unix).to.eql(time.day(now).unix());
  });
});

describe('time.now', () => {
  it('now', () => {
    const d = new Date();
    const dt = d.getTime();
    const utc = time.now;
    expect(utc.date.getTime()).to.be.within(dt - 10, dt + 10);
    expect(utc.timestamp).to.be.within(dt - 10, dt + 10);
    expect(utc.unix).to.eql(time.day(d).unix());
  });
});
