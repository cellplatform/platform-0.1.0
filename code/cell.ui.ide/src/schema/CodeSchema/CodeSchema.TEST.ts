import { CodeSchema } from '.';
import { expect, fs, stub, t } from '../../test';

// NB: Fixed namespaces passed in to avoid re-generating new file on each test-run.
const namespaces = stub.namespaces;

describe('CodeSchema', () => {
  it('declare (generate namespaces)', () => {
    const schema = CodeSchema.declare();
    const { namespaces } = schema;
    const obj = schema.def.toObject();

    type D = t.CellTypeDef;
    expect((obj[namespaces.CodeFile].columns.A?.props?.def as D).prop).to.eql('CodeFile.name');
    // expect((obj[namespaces.Language].columns.A?.props?.def as D).prop).to.eql('Language.name');
  });

  it('declare (provide namespaces)', () => {
    const schema = CodeSchema.declare({ namespaces });
    const keys = Object.keys(schema.def.toObject());
    expect(keys).to.include(namespaces.CodeFile);
    // expect(keys).to.include(namespaces.Language);
  });

  it('save [types.code.g.ts]', async () => {
    const path = fs.resolve('src/types/types.code.g.ts');
    const schema = CodeSchema.declare({ namespaces });
    await schema.def.typescript().save(fs, path);

    // const code = (await fs.readFile(path)).toString();
    // expect(code).to.include('declare type Code = {');
    // expect(code).to.include('declare type Language = {');
  });
});
