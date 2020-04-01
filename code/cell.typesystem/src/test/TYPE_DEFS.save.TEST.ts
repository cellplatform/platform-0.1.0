import { fs, testFetch, TYPE_DEFS } from '.';
import { TypeClient } from '../TypeSystem/TypeClient';

describe.only('TypeSystem: generate sample typescript declaration files', () => {
  const dir = fs.join(__dirname, '../test/.d.ts');

  const save = async (ns: string) => {
    ns = ns.trim().replace(/^ns\:/, '');

    const fetch = testFetch({ defs: TYPE_DEFS });
    const def = await TypeClient.load({ ns, fetch });

    const ts = TypeClient.typescript(def);
    await ts.save(fs, dir, { filename: ns });
  };

  it('save: test/foo.d.ts', async () => save('foo'));
  it('save: test/foo.primitives.d.ts', async () => save('foo.primitives'));
  it('save: test/foo.messages.d.ts', async () => save('foo.messages'));
  it('save: test/foo.enum.d.ts', async () => save('foo.enum'));
  it('save: test/foo.defaults.d.ts', async () => save('foo.defaults'));
});
