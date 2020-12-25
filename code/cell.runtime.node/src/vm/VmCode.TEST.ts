import { expect, fs } from '../test';
import { VmCode } from './VmCode';

const tmp = fs.resolve('./tmp/test.vm');

const writeCode = async (filename: string, code: string) => {
  filename = fs.join(tmp, filename);
  await fs.ensureDir(fs.dirname(filename));
  await fs.writeFile(filename, code);

  return { filename, code };
};

describe('vm', () => {
  describe('VmScript', () => {
    it('get: new (compile)', async () => {
      const code = 'console.log(123);';
      const { filename } = await writeCode('foo.js', code);

      expect(VmCode.cache.exists(filename)).to.eql(false);

      const res = await VmCode.get(filename);
      expect(VmCode.cache.exists(filename)).to.eql(true);

      expect(res.elased).to.greaterThan(1);
      expect(res.script.filename).to.eql(filename);
      expect(res.script.code).to.eql(code);
      expect(res.script.compiler).to.eql('javascript');
    });

    it('get: cached', async () => {
      const code = 'console.log(123);';
      const { filename } = await writeCode('foo.js', code);
      const res1 = await VmCode.get(filename);
      const res2 = await VmCode.get(filename);
      expect(res1).to.equal(res2);
    });
  });
});
