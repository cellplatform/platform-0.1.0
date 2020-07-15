import { expect, t, fs, TypeSystem, stub } from '../test';
import { AppSchema } from '.';

// NB: Fixed namespaces passed in to avoid re-generating new file on each test-run.
const namespaces = stub.namespaces;

describe('AppSchema', () => {
  it('declare (generate namespaces)', () => {
    const schema = AppSchema.declare();
    const { namespaces } = schema;
    const obj = schema.def.toObject();

    type D = t.CellTypeDef;
    expect((obj[namespaces.App].columns.A?.props?.def as D).prop).to.eql('App.name');
    expect((obj[namespaces.AppWindow].columns.A?.props?.def as D).prop).to.eql('AppWindow.app');
    expect((obj[namespaces.AppData].columns.A?.props?.def as D).prop).to.eql('AppData.app');

    const expectGreaterThan = (key: string, length: number) => {
      const columns = obj[key].columns;
      expect(Object.keys(columns).length).to.greaterThan(length);
    };

    expectGreaterThan(namespaces.App, 10);
    expectGreaterThan(namespaces.AppWindow, 6);
    expectGreaterThan(namespaces.AppData, 3);
  });

  it('declare (provide namespaces)', () => {
    const schema = AppSchema.declare({ namespaces });
    const keys = Object.keys(schema.def.toObject());
    expect(keys).to.include(namespaces.App);
    expect(keys).to.include(namespaces.AppWindow);
    expect(keys).to.include(namespaces.AppData);
  });

  it('save [types.g.ts]', async () => {
    const path = fs.resolve('src/types/types.g.ts');
    const schema = AppSchema.declare({ namespaces });

    await schema.def.typescript().save(fs, path);
    const code = (await fs.readFile(path)).toString();

    expect(code).to.include('declare type App = {');
    expect(code).to.include('declare type AppWindow = {');
    expect(code).to.include('declare type AppData = {');
  });
});
