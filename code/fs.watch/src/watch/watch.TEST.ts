import { expect, fs, wait } from '../test';
import { watch } from '.';

const dir = fs.resolve('tmp/test');

describe('watch', () => {
  beforeEach(async () => {
    await fs.remove(dir);
    await fs.ensureDir(dir);
  });

  it('adds pattern', async () => {
    const pattern = fs.join(dir, '*');
    const watcher = watch.start({ pattern });
    expect(watcher.pattern).to.eql(pattern);
    watcher.dispose();
  });

  it('file changes (add/change)', async () => {
    const pattern = fs.join(dir, '*');
    const watcher = watch.start({ pattern });

    const events: watch.FsWatchEvent[] = [];
    watcher.events$.subscribe(e => events.push(e));

    await fs.writeFile(fs.join(dir, 'foo.txt'), 'Hello');
    await fs.writeFile(fs.join(dir, 'foo.txt'), 'Boo');
    await fs.writeFile(fs.join(dir, 'bar.txt'), 'Bar');

    await wait(500);

    expect(events.length).to.eql(3);
    expect(events[0].type).to.eql('add');
    expect(events[1].type).to.eql('change');
    expect(events[2].type).to.eql('add');

    expect(events[0].path.endsWith('foo.txt')).to.eql(true);
    expect(events[1].path.endsWith('foo.txt')).to.eql(true);
    expect(events[2].path.endsWith('bar.txt')).to.eql(true);

    expect(events.every(e => e.isFile)).to.eql(true);
    expect(events.every(e => e.isDir)).to.eql(false);

    watcher.dispose();
  });

  it('file (remove)', async () => {
    const pattern = fs.join(dir, '*');
    const watcher = watch.start({ pattern });

    const events: watch.FsWatchEvent[] = [];
    watcher.events$.subscribe(e => events.push(e));

    const path = fs.join(dir, 'foo.txt');
    await fs.writeFile(path, 'Hello');

    await wait(500);
    expect(events.length).to.eql(2);
    expect(events[0].type).to.eql('add');
    expect(events[1].type).to.eql('change');

    await fs.remove(path);

    await wait(500);
    expect(events[2].type).to.eql('remove');

    expect(events.every(e => e.isFile)).to.eql(true);
    expect(events.every(e => e.isDir)).to.eql(false);

    watcher.dispose();
  });

  it('directory (add/remove)', async () => {
    const pattern = fs.join(dir, '*');
    const watcher = watch.start({ pattern });

    const events: watch.FsWatchEvent[] = [];
    watcher.events$.subscribe(e => events.push(e));

    await fs.ensureDir(fs.join(dir, 'foo'));

    await wait(500);
    expect(events[0].type).to.eql('add');

    await fs.remove(fs.join(dir, 'foo'));

    await wait(500);
    expect(events[1].type).to.eql('remove');
    expect(events.every(e => e.isFile)).to.eql(false);
    expect(events.every(e => e.isDir)).to.eql(true);

    watcher.dispose();
  });

  it('stop watching (dispose)', async () => {
    const pattern = fs.join(dir, '*');
    const watcher = watch.start({ pattern });

    let events: watch.FsWatchEvent[] = [];
    watcher.events$.subscribe(e => events.push(e));

    await fs.writeFile(fs.join(dir, 'foo.txt'), 'Hello');
    await wait(500);
    expect(events.length).to.eql(2);

    watcher.dispose();
    events = [];

    await fs.writeFile(fs.join(dir, 'foo.txt'), 'Boo');
    await fs.writeFile(fs.join(dir, 'foo.txt'), 'Bar');
    await fs.writeFile(fs.join(dir, 'foo.txt'), 'Baz');
    expect(events.length).to.eql(0); // No more events.

    expect(watcher.isDisposed).to.eql(true);
  });
});
