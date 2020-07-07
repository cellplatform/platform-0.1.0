import { expect, t, fs, TypeSystem } from '../test';
import { AppSchema } from '.';

describe('AppSchema', () => {
  describe('AppSchema.declare', () => {
    it('declare', () => {
      const res = AppSchema.declare();
      const { namespaces } = res;
      const defs = res.toObject();

      type D = t.CellTypeDef;
      expect((defs[namespaces.App].columns.A?.props?.def as D).prop).to.eql('App.name');
      expect((defs[namespaces.AppWindow].columns.A?.props?.def as D).prop).to.eql('AppWindow.app');
      expect((defs[namespaces.AppData].columns.A?.props?.def as D).prop).to.eql('AppData.app');

      const expectGreaterThan = (key: string, length: number) => {
        const columns = defs[key].columns;
        expect(Object.keys(columns).length).to.greaterThan(length);
      };

      expectGreaterThan(namespaces.App, 10);
      expectGreaterThan(namespaces.AppWindow, 6);
      expectGreaterThan(namespaces.AppData, 3);
    });

    it('save [types.g.ts]', async () => {
      const res = AppSchema.declare();
      const typeDefs = res.toTypeDefs();

      const ts = TypeSystem.typescript(typeDefs);
      const path = fs.resolve('src/types.g.ts');
      await ts.save(fs, path);

      const code = (await fs.readFile(path)).toString();
      expect(code).to.include('declare type App = {');
      expect(code).to.include('declare type AppWindow = {');
      expect(code).to.include('declare type AppData = {');
    });
  });
});
