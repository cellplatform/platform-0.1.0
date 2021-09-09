import { t, nodefs, Http, rx, Filesystem } from '../test';
import { Vercel } from '../node.Vercel';

describe('DEPLOY [INTEGRATION]', function () {
  this.timeout(999999);

  const bus = rx.bus();
  const store = Filesystem.Controller({ bus, fs: nodefs.resolve('tmp') });
  const fs = store.fs();

  const token = process.env.VERCEL_TEST_TOKEN ?? '';
  const client = Vercel.Http({ fs, token });

  const getTeamId = async (index?: number) => {
    const teams = (await client.teams.list()).teams;
    return teams[index ?? 1].id;
  };

  const getTeam = async (index?: number) => {
    return client.team(await getTeamId(index));
  };

  it('deploy: paul.goodbye (binary)', async () => {
    const team = await getTeam();
    const source = await Vercel.Fs.readdir(fs, 'paul');

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

  it.only('deploy: rnz (binary)', async () => {
    const team = await getTeam();
    const source = await Vercel.Fs.readdir(fs, 'rnz');

    // const p = await team.project('education').create();
    // return;

    const target = 'production';
    const project = team.project('education');
    const regions = ['sfo1'];
    const alias = 'radio.nz.education';
    const res = await project.deploy({
      source,
      target,
      regions,
      alias,
      name: 'rnz-v1.0.0',
    });

    console.log('-------------------------------------------');
    console.log('res', res);
  });

  it('deploy: sys.<module> (binary)', async () => {
    const store = Filesystem.Controller({ bus, fs: nodefs.resolve('../../pkg.sys/ui.code') });
    const fs = store.fs();

    const team = await getTeam();
    const source = await Vercel.Fs.readdir(fs, 'dist/web');

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
