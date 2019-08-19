import { expect } from 'chai';
import { glob } from '.';
import { basename, resolve } from 'path';

describe('glob', () => {
  it('finds several files', async () => {
    const pattern = `${__dirname}/glob*.ts`;
    const res = await glob.find(pattern);
    expect(res.length).to.eql(2);
    const names = res.map(p => basename(p));
    expect(names).to.include('glob.TEST.ts');
    expect(names).to.include('glob.ts');
  });

  it('returns no dot-files (default)', async () => {
    const pattern = resolve('./test/sample/tmpl-1/*');
    const res = await glob.find(pattern);
    const dotFiles = res.map(path => basename(path)).filter(file => file.startsWith('.'));
    expect(dotFiles).to.eql([]);
  });

  it('returns dot-files', async () => {
    const pattern = resolve('./test/sample/tmpl-1/*');
    const res = await glob.find(pattern, { dot: true });
    const files = res.map(path => basename(path)).filter(file => file.startsWith('.'));
    expect(files).to.include('.babelrc');
    expect(files).to.include('.gitignore');
  });

  it('returns only files (by default)', async () => {
    const pattern = resolve('./test/sample/tmpl-1/*');
    const res = await glob.find(pattern);
    const names = res.map(p => basename(p));
    expect(names).to.not.include('src');
  });

  it('returns only directories', async () => {
    const pattern = resolve('./test/sample/tmpl-1/*/');
    const res = await glob.find(pattern, { includeDirs: true });
    const names = res.map(p => basename(p));
    expect(names).to.include('src');
  });
});
