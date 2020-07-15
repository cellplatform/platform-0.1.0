import { t, expect, stub, fs, TypeSystem } from '../../test';
import { CodeSchema } from '.';

// NB: Fixed namespaces passed in to avoid re-generating new file on each test-run.
const namespaces = stub.namespaces;

describe('CodeSchema', () => {
  it('declare (generate namespaces)', () => {
    const schema = CodeSchema.declare();
    const { namespaces } = schema;
    const obj = schema.def.toObject();

    type D = t.CellTypeDef;
    expect((obj[namespaces.Code].columns.A?.props?.def as D).prop).to.eql('Code.name');
    expect((obj[namespaces.Language].columns.A?.props?.def as D).prop).to.eql('Language.name');
  });

  it('declare (provide namespaces)', () => {
    const schema = CodeSchema.declare({ namespaces });
    const keys = Object.keys(schema.def.toObject());
    expect(keys).to.include(namespaces.Code);
    expect(keys).to.include(namespaces.Language);
  });

  it('save [types.code.g.ts]', async () => {
    const path = fs.resolve('src/types/types.code.g.ts');
    const schema = CodeSchema.declare({ namespaces });
    await schema.def.typescript().save(fs, path);

    const code = (await fs.readFile(path)).toString();
    expect(code).to.include('declare type Code = {');
    expect(code).to.include('declare type Language = {');
  });
});
