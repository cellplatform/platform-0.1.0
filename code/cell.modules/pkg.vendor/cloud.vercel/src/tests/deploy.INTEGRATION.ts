import { VercelHttp } from '../node.VercelHttp';
import { t, nodefs, Http, rx, Filesystem } from '../test';
import { DEFAULT } from './common';
// import { VercelUploadFiles } from './VercelHttp.Files.Upload';

describe('DEPLOY [INTEGRATION]', function () {
  this.timeout(999999);

  const bus = rx.bus();
  const store = Filesystem.Controller({ bus, fs: nodefs.resolve('tmp') });
  const fs = store.fs();

  const token = process.env.VERCEL_TEST_TOKEN ?? '';
  const client = VercelHttp({ fs, token });
  // const http = Http.create();
  // const ctx = util.toCtx(fs, http, token);

  const getTeamId = async (index?: number) => {
    const teams = (await client.teams.list()).teams;
    return teams[index ?? 1].id;
  };

  const getTeam = async (index?: number) => {
    return client.team(await getTeamId(index));
  };

  it.only('deploy: paul.goodbye (binary)', async () => {
    const team = await getTeam();
    const dir = fs.dir('paul');

    const manifest = await dir.manifest();
    const wait = manifest.files.map(async ({ path }) => ({ path, data: await dir.read(path) }));
    const files: t.VercelFile[] = await Promise.all(wait); //.filter((file) => Boolean(file.data));
    const source: t.VercelSourceBundle = { files, manifest };

    const target = 'production';
    const project = team.project('family');
    const regions = ['sfo1'];
    const alias = 'paul.sys.family';
    const res = await project.deploy({
      source,
      target,
      regions,
      alias,
      name: 'paul.goodbye-v1.0.0',
    });

    console.log('-------------------------------------------');
    console.log('res', res);
  });

  it('deploy: sys.<module> (binary)', async () => {
    const root = nodefs.resolve('../../pkg.sys/ui.code');

    console.log('root', root);

    const store = Filesystem.Controller({ bus, fs: root });
    const fs = store.fs();

    const team = await getTeam();
    const dir = fs.dir('dist/web');

    const manifest = await dir.manifest();
    const wait = manifest.files.map(async ({ path }) => ({ path, data: await dir.read(path) }));
    const files: t.VercelFile[] = await Promise.all(wait); //.filter((file) => Boolean(file.data));
    const source: t.VercelSourceBundle = { files, manifest };

    // console.log('manifest', manifest);
    // return;

    const target = 'production';
    const project = team.project('tdb-dev');
    const regions = ['sfo1'];
    const alias = 'code.dev.db.team';
    const res = await project.deploy({
      source,
      target,
      regions,
      alias,
      name: 'sys.ui.MODULE-v0.0.0',
    });

    console.log('-------------------------------------------');
    console.log('res', res);
  });
});

// import * from '../../../../pkg.sys/ui.code/dist/web'
