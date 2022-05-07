import { expect, nodefs, t, ManifestFiles } from '../test';
import { Vercel } from '.';

const token = process.env.VERCEL_TEST_TOKEN ?? '';

describe('Vercel', () => {
  describe('VercelFs', () => {
    describe('readdir', () => {
      it('root (no path)', async () => {
        const { fs, dispose } = Vercel.Node({ token, dir: 'static.test/node' });
        const { files, manifest } = await Vercel.Fs.readdir(fs);

        expect(files.length).to.eql(2);
        expect(files.map(({ path }) => path)).to.eql(manifest.files.map(({ path }) => path));
        expect((manifest as any).kind).to.eql('dir');

        dispose();
      });

      it('path (child directory)', async () => {
        const { fs, dispose } = Vercel.Node({ token, dir: 'static.test/web' });
        const { files } = await Vercel.Fs.readdir(fs, 'images');

        expect(files.length).to.eql(1);
        expect(files[0].path).to.eql('kitten.jpg');
        dispose();
      });
    });

    describe('info', () => {
      it('module', async () => {
        const { fs, dispose } = Vercel.Node({ token, dir: 'static.test' });
        const source = 'node';
        const info = await Vercel.Fs.info({ fs, source });
        expect(info.meta.kind).to.eql('bundle:code/module');
        expect(info.version).to.eql(info.meta.version);
        expect(info.name).to.eql(`vercel.sample.node-v${info.version}`);
        expect(info.size.bytes).to.greaterThan(500);

        const dir = await Vercel.Fs.readdir(fs, source);
        const hash = ManifestFiles.hash(
          dir.manifest.files.filter((file) => file.path !== 'index.json'),
        );

        expect(info.meta.fileshash).to.eql(hash);
        expect(info.files.total).to.eql(2);
        expect(info.files.hash).to.eql(hash);
        dispose();
      });

      it('raw folder', async () => {
        const source = 'child';
        const { fs, dispose } = Vercel.Node({ token, dir: 'static.test' });
        const info = await Vercel.Fs.info({ fs, source });
        const dir = await Vercel.Fs.readdir(fs, source);
        const hash = ManifestFiles.hash(dir.manifest.files);

        expect(info.name).to.eql(`unnamed-v0.0.0`);
        expect(info.version).to.eql('0.0.0');
        expect(info.meta.fileshash).to.eql(hash);
        expect(info.size.bytes).to.greaterThan(500);
        expect(info.files.total).to.eql(3);
        expect(info.files.hash).to.eql(hash);

        dispose();
      });

      it('files.toString()', async () => {
        const { fs, dispose } = Vercel.Node({ token, dir: 'static.test' });
        const source = 'node';
        const info = await Vercel.Fs.info({ fs, source });

        const res = info.files.toString();
        dispose();

        expect(res).to.include('kB');
        expect(res).to.include(' files)');
        expect(res).to.include('SHA256(');
      });
    });
  });

  describe('Deploy', () => {
    const dir = 'static.test/node';
    const team = 'my-team';
    const project = 'my-project';

    it('init', () => {
      const deployment = Vercel.Deploy({ token, dir, team, project });
      expect(deployment.dir).to.eql(nodefs.resolve(dir));
      expect(deployment.team).to.eql(team);
      expect(deployment.project).to.eql(project);
    });

    it('dispose', () => {
      const deployment = Vercel.Deploy({ token, dir, team, project });
      let count = 0;
      deployment.dispose$.subscribe(() => count++);

      deployment.dispose();
      deployment.dispose();
      expect(count).to.eql(1);
    });

    describe('manifest', () => {
      it('exists', async () => {
        const deployment = Vercel.Deploy({ token, dir: 'static.test/node', team, project });
        const manifest = await deployment.manifest<t.ModuleManifest>();
        expect(manifest?.kind).to.eql('module');
        expect(manifest?.module.namespace).to.eql('vercel.sample.node');
      });

      it('does not exist', async () => {
        const deployment = Vercel.Deploy({ token, dir: 'static.test/data', team, project });
        const manifest = await deployment.manifest();
        expect(manifest).to.eql(undefined);
      });
    });

    describe('info', () => {
      it('with manifest', async () => {
        const deployment = Vercel.Deploy({ token, dir: 'static.test/node', team, project });
        const info = await deployment.info();

        expect(info.meta.kind).to.eql('bundle:code/module');
        expect(info.version).to.eql(info.meta.version);
        expect(info.name).to.eql(`vercel.sample.node-v${info.version}`);
        expect(info.size.bytes).to.greaterThan(500);
      });

      it('without manifest (raw folder)', async () => {
        const deployment = Vercel.Deploy({ token, dir: 'static.test/web/images', team, project });
        const info = await deployment.info();

        expect(info.name).to.eql(`unnamed-v0.0.0`);
        expect(info.version).to.eql('0.0.0');
        expect(info.size.bytes).to.greaterThan(500);
      });
    });
  });
});
