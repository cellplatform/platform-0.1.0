import { expect } from 'chai';
import { time } from '.';

const FORMAT = 'YYYY-MM-DD hh:mm:ss';
const format = (date: Date) => time.day(date).format(FORMAT);

describe('timer', () => {
  it('starts with current date', () => {
    const now = time.day().format(FORMAT);
    const timer = time.timer();
    expect(format(timer.startedAt)).to.eql(now);
  });

  it('starts with given date', () => {
    const start = time
      .day()
      .add(1, 'd')
      .toDate();
    const timer = time.timer(start);
    expect(format(timer.startedAt)).to.eql(format(start));
    expect(format(timer.startedAt)).to.not.eql(format(new Date()));
  });

  it('reports elapsed milliseconds', async () => {
    const timer = time.timer();
    expect(timer.elapsed()).to.lessThan(5); // NB: 'msecs' default unit for `elapsed`.
    await time.wait(10);
    expect(timer.elapsed()).to.greaterThan(6);
    expect(timer.elapsed('ms')).to.greaterThan(6);
    expect(timer.elapsed('msec')).to.greaterThan(6);
  });

  it('reports elapsed seconds (no decimal)', async () => {
    const start = time
      .day()
      .subtract(1, 'minute')
      .subtract(30, 'second')
      .toDate();
    const timer = time.timer(start) as time.ITimer;
    expect(timer.elapsed('s')).to.eql(90);
    expect(timer.elapsed('sec')).to.eql(90);
  });

  it('reports elapsed seconds (1 decimal place)', async () => {
    const start = time
      .day()
      .subtract(123, 'ms')
      .toDate();
    const timer = time.timer(start);
    expect(timer.elapsed('s')).to.eql(0.1);
    expect(timer.elapsed('sec')).to.eql(0.1);
  });
});
