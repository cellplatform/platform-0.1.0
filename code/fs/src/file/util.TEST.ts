import { expect } from 'chai';
import { expectError } from '@platform/test';
import { yaml } from '../common';
import { fs } from '..';
import * as util from './util';

describe('file.loadAndParse', () => {
  it('throws if file-type not supported', async () => {
    expectError(() => util.loadAndParse('./test/file/file'));
    expectError(() => util.loadAndParse('./test/file/file.doc'));

    expect(() => util.loadAndParseSync('./test/file/file')).to.throw();
    expect(() => util.loadAndParseSync('./test/file/file.doc')).to.throw();
  });

  it('throws if file cannot be parsed', async () => {
    expectError(() => util.loadAndParse('./test/file/fail.json'));
    expectError(() => util.loadAndParse('./test/file/fail.yml'));

    expect(() => util.loadAndParseSync('./test/file/fail.json')).to.throw();
    expect(() => util.loadAndParseSync('./test/file/fail.yml')).to.throw();
  });

  it('return nothing when file not found', async () => {
    expect(util.loadAndParseSync('/NO_EXIST')).to.eql(undefined);
    expect(await util.loadAndParse('/NO_EXIST')).to.eql(undefined);
  });

  it('return nothing when directory is passed (requires a file)', async () => {
    expect(util.loadAndParseSync('./test/file')).to.eql(undefined);
    expect(await util.loadAndParse('./test/file')).to.eql(undefined);
  });

  it('returns a default value', async () => {
    const DEFAULT = { foo: 123 };
    expect(util.loadAndParseSync('/NO_EXIST', DEFAULT)).to.eql(DEFAULT);
    expect(await util.loadAndParse('/NO_EXIST', DEFAULT)).to.eql(DEFAULT);
  });

  it('loads and parses JSON', async () => {
    type MyType = { name: string };
    const path = './test/file/foo.json';
    const res1 = await util.loadAndParse<MyType>(path);
    const res2 = util.loadAndParseSync<MyType>(path);
    expect(res1 && res1.name).to.eql('Bob');
    expect(res2 && res2.name).to.eql('Bob');
  });

  it('loads and parses [yml]', async () => {
    type MyType = { foo: { ext: string } };
    const path = './test/file/foo.yml';
    const res1 = await util.loadAndParse<MyType>(path);
    const res2 = util.loadAndParseSync<MyType>(path);
    expect(res1 && res1.foo.ext).to.eql('yml');
    expect(res2 && res2.foo.ext).to.eql('yml');
  });

  it('loads and parses [yaml]', async () => {
    type MyType = { foo: { ext: string } };
    const path = './test/file/foo.yaml';
    const res1 = await util.loadAndParse<MyType>(path);
    const res2 = util.loadAndParseSync<MyType>(path);
    expect(res1 && res1.foo.ext).to.eql('yaml');
    expect(res2 && res2.foo.ext).to.eql('yaml');
  });
});

describe('file.stringifyAndSave', () => {
  const TMP = fs.resolve('./tmp');
  afterEach(async () => fs.remove(TMP));

  const readTmp = (name: string) => {
    const path = fs.resolve(fs.join('./tmp', name));
    return fs.readFileSync(path, 'utf8');
  };

  it('throws if file-type not supported', async () => {
    const obj = { foo: 123 };
    expectError(() => util.stringifyAndSave('./tmp/file', obj));
    expectError(() => util.stringifyAndSave('./tmp/file.doc', obj));

    expect(() => util.stringifyAndSaveSync('./tmp/file', obj)).to.throw();
    expect(() => util.stringifyAndSaveSync('./tmp/file.doc', obj)).to.throw();
  });

  it('saves [yml, yaml]', async () => {
    const obj = { name: 'Mary', list: [1, 2, 3] };
    const text = yaml.dump(obj);

    const res1 = await util.stringifyAndSave('./tmp/file-1.yml', obj);
    const res2 = util.stringifyAndSaveSync('./tmp/file-2.yaml', obj);
    const res3 = await util.stringifyAndSave('./tmp/file-3.yml', obj);
    const res4 = util.stringifyAndSaveSync('./tmp/file-4.yaml', obj);

    expect(res1).to.eql(text);
    expect(res2).to.eql(text);
    expect(res3).to.eql(text);
    expect(res4).to.eql(text);

    const file1 = readTmp('file-1.yml');
    const file2 = readTmp('file-2.yaml');
    const file3 = readTmp('file-3.yml');
    const file4 = readTmp('file-4.yaml');

    expect(file1).to.eql(text);
    expect(file2).to.eql(text);
    expect(file3).to.eql(text);
    expect(file4).to.eql(text);
  });

  it('saves [json]', async () => {
    const obj = { name: 'Mary', list: [1, 2, 3] };
    const text = `${JSON.stringify(obj, null, '  ')}\n`;

    const res1 = await util.stringifyAndSave('./tmp/file-1.json', obj);
    const res2 = util.stringifyAndSaveSync('./tmp/file-2.json', obj);

    expect(res1).to.eql(text);
    expect(res2).to.eql(text);

    const file1 = readTmp('file-1.json');
    const file2 = readTmp('file-2.json');

    expect(file1).to.eql(text);
    expect(file2).to.eql(text);
  });

  it('calls BEFORE handler (async)', async () => {
    const obj = { foo: 123 };
    const res = await util.stringifyAndSave('./tmp/file-1.json', obj, {
      beforeSave: async e => {
        const filename = fs.basename(e.path);
        return `// Inserted comment for file '${filename}' \n${e.text}`;
      },
    });
    const file1 = readTmp('file-1.json');
    expect(res).to.include(`// Inserted comment for file 'file-1.json'`);
    expect(file1).to.include(`// Inserted comment for file 'file-1.json'`);
  });

  it('calls BEFORE handler (async)', () => {
    const obj = { foo: 123 };
    const res = util.stringifyAndSaveSync('./tmp/file-1.json', obj, {
      beforeSave: e => {
        const filename = fs.basename(e.path);
        return `// Inserted comment for file '${filename}' \n${e.text}`;
      },
    });
    const file1 = readTmp('file-1.json');
    expect(res).to.include(`// Inserted comment for file 'file-1.json'`);
    expect(file1).to.include(`// Inserted comment for file 'file-1.json'`);
  });
});
