import { VercelHttp } from '.';
import { fs, Http } from '../test';
import { DEFAULT, util } from './common';
import { VercelUploadFiles } from './VercelHttp.Files.Upload';

/**
 * See:
 *    https://vercel.com/docs/api#endpoints
 *
 */
describe.only('VercelHttp [INTEGRATION]', function () {
  this.timeout(30000);

  const token = process.env.VERCEL_TEST_TOKEN ?? '';
  const client = VercelHttp({ fs, token });
  const http = Http.create();
  const ctx = util.toCtx(fs, http, token);

  const getTeamId = async (index?: number) => {
    const teams = (await client.teams.list()).teams;
    return teams[index ?? 1].id;
  };

  const getTeam = async (index?: number) => {
    return client.team(await getTeamId(index));
  };

  describe('teams', () => {
    it('teams.list', async () => {
      const res = await client.teams.list();
      console.log('teams:', res);
    });
  });

  describe('team', () => {
    it('team.info', async () => {
      const team = await getTeam();
      const res = await team.info();
      console.log('info', res.team);
    });

    it('team.projects', async () => {
      const team = await getTeam();
      const res = await team.projects({});
      res.projects.forEach((proj) => {
        console.log(' > ', proj.id, proj.name);
      });
    });
  });

  describe.skip('deployment', () => {
    it('team.deploy', async () => {
      /**
       * Forum/Question:
       *    calculating `x-now-digest` SHA1 hash #6499
       *    https://github.com/vercel/vercel/discussions/6499
       */

      // const dir = fs.resolve('tmp/web');
      // const dir = fs.resolve('dist/node');
      // const dir = fs.resolve('../../pkg.sys/net/dist/web');

      const dirs = {
        // home: '/Users/phil/code/@tdb/deploy/archive.landing',
        esic: '/Users/phil/code/@tdb/modules/slc/dist/web',
        // esicZip: '/Users/phil/code/@tdb/modules/slc/dist/web',
      };

      const tmp = fs.resolve('./tmp/deploy');
      await fs.remove(tmp);
      await fs.ensureDir(tmp);

      // EU (ESIC)
      await fs.copy(dirs.esic, fs.join(tmp, 'prog/esic.2021'));
      await fs.remove(fs.join(tmp, 'static/images'));

      // Home (Landing Page)
      await (async () => {
        // const targetDir = ;
        const zip = fs.join(tmp, 'home.zip');
        await fs.copy('/Users/phil/code/@tdb/_archive/slc.prod.landing.zip', zip);

        await fs.unzip(zip, fs.join(tmp));
        await fs.rename(fs.join(tmp, 'slc.prod.landing'), fs.join(tmp, 'home'));
        await fs.remove(zip);
      })();

      // return;

      // const dir = '/Users/phil/code/@tdb/modules/slc/dist/web';
      // const dir = fs.resolve('../../pkg.sys/ui.code/dist/web');
      const dir = tmp;

      console.log('deploying:', dir);

      const getRoutes = async (dir: string, src: string, dest: string) => {
        const paths = (await fs.glob.find(`${dir}/**/*`)).map((p) => p.substring(dir.length + 1));
        const routes = paths.map((path) => {
          return {
            src: fs.join(src, path),
            dest: fs.join(dest, path),
          };
        });
        return [
          {
            src: fs.join(src, '/'),
            dest: fs.join(dest, '/index.html'),
          },
          ...routes,
        ];
      };

      /**
       * Setup routing.
       */
      const routes = [
        ...(await getRoutes(fs.join(dir, 'home'), '/', '/home')),
        { src: '/prog/esic.2021', dest: '/prog/esic.2021/index.html' },
        {
          src: '/prog/esic.2021/static/images/(.*)',
          dest: 'https://slc-dev-qhtezy14b-tdb.vercel.app/', // INSPECT https://vercel.com/tdb/unnamed/AWgUTMqHp6sx4ca89LSxfeEkxZaA
        },
      ];

      console.log('routes', routes);

      /**
       * Send to vercel.
       */
      const team = await getTeam();
      const target = 'production';
      const project = team.project('slc-prod');
      const regions = ['sfo1'];

      const res = await project.deploy({
        dir,
        target,
        routes,
        regions,
        alias: 'socialleancanvas.com',
      });

      console.log('-------------------------------------------');
      console.log('res', res);
      console.log('-------------------------------------------');
      console.log('source (dir):', dir);
    });

    it('EU: site only', async () => {
      const src = '/Users/phil/code/@tdb/modules/slc/dist/web';
      // const src = '/Users/phil/code/@tdb/modules/slc/dist/web/static/images';
      const dir = fs.resolve('tmp/deploy');
      await fs.remove(dir);
      await fs.ensureDir(dir);
      await fs.copy(src, dir);

      const imagesDir = fs.resolve('tmp/images');
      await fs.remove(imagesDir);
      await fs.move(fs.join(dir, 'static/images'), imagesDir);

      const imagePaths = await fs.glob.find(`${imagesDir}/*/**`);

      const routes = imagePaths.map((path) => {
        path = path.substring(imagesDir.length + 1);

        // INSPECT https://vercel.com/tdb/unnamed/AWgUTMqHp6sx4ca89LSxfeEkxZaA
        const baseUrl = 'https://slc-dev-qhtezy14b-tdb.vercel.app';

        return {
          src: fs.join('/static/images', path),
          dest: `${baseUrl}/${path}`,
        };
      });

      console.log('routes', routes);
      // return;

      const team = await getTeam();

      const target = 'production';
      const project = team.project('slc-dev');
      const regions = ['sfo1'];

      const res = await project.deploy({
        dir,
        target,
        routes,
        regions,
        alias: 'esic.socialleancanvas.com',
      });

      console.log('-------------------------------------------');
      console.log('res', res);
      console.log('-------------------------------------------');
      console.log('source (dir):', dir);
    });

    it('EU: deploy images only', async () => {
      // const src = '/Users/phil/code/@tdb/modules/slc/dist/web';
      const src = '/Users/phil/code/@tdb/modules/slc/dist/web/static/images';
      const dir = fs.resolve('tmp/deploy');
      await fs.remove(dir);
      await fs.ensureDir(dir);
      await fs.copy(src, dir);

      const team = await getTeam();

      // const target = 'production';
      const project = team.project('slc-dev');
      const regions = ['sfo1'];

      const res = await project.deploy({
        dir,
        // target,
        // routes,
        regions,
        // alias: 'dev.socialleancanvas.com',
      });

      console.log('-------------------------------------------');
      console.log('res', res);
      console.log('-------------------------------------------');
      console.log('source (dir):', dir);
    });

    it('team.deployment', async () => {
      const team = await getTeam();

      // const res = await team.deployments();

      // const deployment = team.deployment('slc-dev-cwjb5lfma-tdb.vercel.app');
      const deployment = team.deployment('socialleancanvas.com');

      // const info = await deployment.info();
      // console.log('-------------------------------------------');
      // console.log('info', info);

      const res = await deployment.files();

      // console.log('-------------------------------------------');
      // console.log('res.files[0]', res.files.list[0]);
      // console.log('-------------------------------------------');
      // return;

      const dir = fs.resolve('tmp/save');
      await fs.remove(dir);

      console.log('dir', dir);
      const saved = await res.files.pull(dir);
      console.log('-------------------------------------------');
      // console.log('saved', saved);

      saved.errors.forEach((err) => {
        console.log('err', err);
      });
      //curl "https://api.vercel.com/v11/now/deployments/dpl_BRGyoU2Jzzwx7myBnqv3xjRDD2GnHTwUWyFybnrUvjDD/files/2d4aad419917f15b1146e9e03ddc9bb31747e4d0"
      console.log('saved.ok', saved.ok);
    });
  });

  describe('deployment: upload', () => {
    const client = VercelUploadFiles({ ctx });

    it('post', async () => {
      const path = fs.resolve('static.test/child/foo.d.txt');
      const res = await client.post(path);

      console.log('-------------------------------------------');
      console.log('res', res);
    });

    it('upload file (single)', async () => {
      const path = fs.resolve('static.test/');
      const res = await client.upload(path, {});

      console.log('-------------------------------------------');
      console.log('res', res);
      console.log('res.status', res.status);

      // expect(res.ok).to.eql(true);
    });
  });

  describe('deployment: upload then deploy', () => {
    it.only('deploy', async () => {
      const dir = fs.resolve('./tmp/web');
      const team = await getTeam();

      const target = 'staging';
      const project = team.project('tmp');
      const regions = ['sfo1'];

      const res = await project.deploy({ dir, target, regions });

      console.log('-------------------------------------------');
      console.log('res', res);
      console.log('-------------------------------------------');
      console.log('source (dir):', dir);
    });
  });
});
