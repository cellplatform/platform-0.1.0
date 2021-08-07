import { expect, fs } from '../../test';
import { VercelHttp } from '.';
// import { http, util } from './common';

// import crypto from 'crypto';

/**
 * See:
 *    https://vercel.com/docs/api#endpoints
 *
 * Suggestion from Vercel suuport (example) of generating a SHA1 digets hash
 * for file upload:
 *    https://vercel.com/docs/integrations#webhooks/securing-webhooks
 */

describe('VercelHttp', () => {
  it('create', () => {
    const token = 'abc123';
    const client = VercelHttp({ token });

    // client.
  });
});

// describe.only('Vercel', function () {
//   this.timeout(99999);

//   const token = process.env.VERCEL_TEST_TOKEN ?? '';
//   const client = Vercel({ token });

//   const getTeamId = async (index?: number) => {
//     const teams = (await client.teams.list()).teams;
//     return teams[index ?? 1].id;
//   };

//   const getTeam = async (index?: number) => {
//     return client.team(await getTeamId(index));
//   };

//   describe('util', () => {
//     it('toUrl', () => {
//       expect(util.toUrl(12, '  teams  ')).to.eql('https://api.vercel.com/v12/teams');
//       expect(util.toUrl(12, 'teams?123')).to.eql('https://api.vercel.com/v12/teams'); // NB: Strips query string.
//     });

//     it('toUrl: query', () => {
//       type Q = Record<string, string | number>;

//       const test = (query: Q, expected: string) => {
//         const res = util.toUrl(12, 'projects', query);
//         expect(res).to.eql(`${'https://api.vercel.com/v12/projects'}${expected}`);
//       };

//       test({}, '');
//       test({ teamId: 'foo' }, '?teamId=foo');
//       test({ teamId: 'foo', foo: 123 }, '?teamId=foo&foo=123');
//     });
//   });

//   describe('[INTEGRATION] teams', () => {
//     it('teams.list', async () => {
//       const res = await client.teams.list();
//       console.log('teams:', res);
//     });
//   });

//   describe('[INTEGRATION] team', () => {
//     it('team.info', async () => {
//       const team = await getTeam();
//       const res = await team.info();
//       console.log('info', res.team);
//     });

//     it('team.projects', async () => {
//       const team = await getTeam();
//       const res = await team.projects({});
//       res.projects.forEach((proj) => {
//         console.log(' > ', proj.id, proj.name);
//       });
//     });
//   });

//   describe('[INTEGRATION] deployment', () => {
//     it('team.deploy', async () => {
//       /**
//        * Forum/Question:
//        *    calculating `x-now-digest` SHA1 hash #6499
//        *    https://github.com/vercel/vercel/discussions/6499
//        */

//       // const dir = fs.resolve('tmp/web');
//       // const dir = fs.resolve('dist/node');
//       // const dir = fs.resolve('../../pkg.sys/net/dist/web');

//       const dirs = {
//         // home: '/Users/phil/code/@tdb/deploy/archive.landing',
//         esic: '/Users/phil/code/@tdb/modules/slc/dist/web',
//         // esicZip: '/Users/phil/code/@tdb/modules/slc/dist/web',
//       };

//       const tmp = fs.resolve('./tmp/deploy');
//       await fs.remove(tmp);
//       await fs.ensureDir(tmp);

//       // EU (ESIC)
//       await fs.copy(dirs.esic, fs.join(tmp, 'prog/esic.2021'));
//       await fs.remove(fs.join(tmp, 'static/images'));

//       // Home (Landing Page)
//       await (async () => {
//         // const targetDir = ;
//         const zip = fs.join(tmp, 'home.zip');
//         await fs.copy('/Users/phil/code/@tdb/_archive/slc.prod.landing.zip', zip);

//         await fs.unzip(zip, fs.join(tmp));
//         await fs.rename(fs.join(tmp, 'slc.prod.landing'), fs.join(tmp, 'home'));
//         await fs.remove(zip);
//       })();

//       // return;

//       // const dir = '/Users/phil/code/@tdb/modules/slc/dist/web';
//       // const dir = fs.resolve('../../pkg.sys/ui.code/dist/web');
//       const dir = tmp;

//       console.log('deploying:', dir);

//       const getRoutes = async (dir: string, src: string, dest: string) => {
//         const paths = (await fs.glob.find(`${dir}/**/*`)).map((p) => p.substring(dir.length + 1));
//         const routes = paths.map((path) => {
//           return {
//             src: fs.join(src, path),
//             dest: fs.join(dest, path),
//           };
//         });
//         return [
//           {
//             src: fs.join(src, '/'),
//             dest: fs.join(dest, '/index.html'),
//           },
//           ...routes,
//         ];
//       };

//       /**
//        * Setup routing.
//        */
//       const routes = [
//         ...(await getRoutes(fs.join(dir, 'home'), '/', '/home')),
//         { src: '/prog/esic.2021', dest: '/prog/esic.2021/index.html' },
//         {
//           src: '/prog/esic.2021/static/images/(.*)',
//           dest: 'https://slc-dev-qhtezy14b-tdb.vercel.app/', // INSPECT https://vercel.com/tdb/unnamed/AWgUTMqHp6sx4ca89LSxfeEkxZaA
//         },
//       ];

//       console.log('routes', routes);

//       /**
//        * Send to vercel.
//        */
//       const team = await getTeam();
//       const target = 'production';
//       const project = team.project('slc-prod');
//       const regions = ['sfo1'];

//       const res = await project.deploy({
//         dir,
//         target,
//         routes,
//         regions,
//         alias: 'socialleancanvas.com',
//       });

//       console.log('-------------------------------------------');
//       console.log('res', res);
//       console.log('-------------------------------------------');
//       console.log('source (dir):', dir);
//     });

//     it('EU: site only', async () => {
//       const src = '/Users/phil/code/@tdb/modules/slc/dist/web';
//       // const src = '/Users/phil/code/@tdb/modules/slc/dist/web/static/images';
//       const dir = fs.resolve('tmp/deploy');
//       await fs.remove(dir);
//       await fs.ensureDir(dir);
//       await fs.copy(src, dir);

//       const imagesDir = fs.resolve('tmp/images');
//       await fs.remove(imagesDir);
//       await fs.move(fs.join(dir, 'static/images'), imagesDir);

//       const imagePaths = await fs.glob.find(`${imagesDir}/*/**`);

//       const routes = imagePaths.map((path) => {
//         path = path.substring(imagesDir.length + 1);

//         // INSPECT https://vercel.com/tdb/unnamed/AWgUTMqHp6sx4ca89LSxfeEkxZaA
//         const baseUrl = 'https://slc-dev-qhtezy14b-tdb.vercel.app';

//         return {
//           src: fs.join('/static/images', path),
//           dest: `${baseUrl}/${path}`,
//         };
//       });

//       console.log('routes', routes);
//       // return;

//       const team = await getTeam();

//       const target = 'production';
//       const project = team.project('slc-dev');
//       const regions = ['sfo1'];

//       const res = await project.deploy({
//         dir,
//         target,
//         routes,
//         regions,
//         alias: 'esic.socialleancanvas.com',
//       });

//       console.log('-------------------------------------------');
//       console.log('res', res);
//       console.log('-------------------------------------------');
//       console.log('source (dir):', dir);
//     });

//     it('EU: deploy images only', async () => {
//       // const src = '/Users/phil/code/@tdb/modules/slc/dist/web';
//       const src = '/Users/phil/code/@tdb/modules/slc/dist/web/static/images';
//       const dir = fs.resolve('tmp/deploy');
//       await fs.remove(dir);
//       await fs.ensureDir(dir);
//       await fs.copy(src, dir);

//       const team = await getTeam();

//       // const target = 'production';
//       const project = team.project('slc-dev');
//       const regions = ['sfo1'];

//       const res = await project.deploy({
//         dir,
//         // target,
//         // routes,
//         regions,
//         // alias: 'dev.socialleancanvas.com',
//       });

//       console.log('-------------------------------------------');
//       console.log('res', res);
//       console.log('-------------------------------------------');
//       console.log('source (dir):', dir);
//     });

//     it('team.deployment', async () => {
//       const team = await getTeam();

//       // const res = await team.deployments();

//       // const deployment = team.deployment('slc-dev-cwjb5lfma-tdb.vercel.app');
//       const deployment = team.deployment('socialleancanvas.com');

//       // const info = await deployment.info();
//       // console.log('-------------------------------------------');
//       // console.log('info', info);

//       const res = await deployment.files();

//       // console.log('-------------------------------------------');
//       // console.log('res.files[0]', res.files.list[0]);
//       // console.log('-------------------------------------------');
//       // return;

//       const dir = fs.resolve('tmp/save');
//       await fs.remove(dir);

//       console.log('dir', dir);
//       const saved = await res.files.save(dir);
//       console.log('-------------------------------------------');
//       // console.log('saved', saved);

//       saved.errors.forEach((err) => {
//         console.log('err', err);
//       });
//       //curl "https://api.vercel.com/v11/now/deployments/dpl_BRGyoU2Jzzwx7myBnqv3xjRDD2GnHTwUWyFybnrUvjDD/files/2d4aad419917f15b1146e9e03ddc9bb31747e4d0"
//       console.log('saved.ok', saved.ok);
//     });
//   });

//   it.only('upload files', async () => {
//     console.log('upload files');

//     function toSha1(file: Buffer) {
//       const signature = crypto.createHmac('sha1', token).update(file).digest('hex');
//       // return signature === req.headers['x-vercel-signature'];
//       return signature;
//     }

//     const ctx = util.toCtx(token, 11);
//     const path = fs.resolve('tmp/web/index.html');
//     const file = await fs.readFile(path);
//     const hash = toSha1(file);

//     const headers = {
//       ...ctx.headers,
//       'x-vercel-digest': hash,
//       'Content-Length': file.byteLength.toString(),
//     };

//     const team = await getTeam();
//     const teamId = team.id;

//     const url = util.toUrl(11, 'now/files', { teamId });

//     console.log();
//     console.log('url', url);
//     console.log('headers', headers);
//     console.log('-------------------------------------------');
//     console.log();

//     const res = await http.post(url, file, { headers });

//     console.log('res', res.status);
//     console.log('res.json', res.json);
//   });
// });
