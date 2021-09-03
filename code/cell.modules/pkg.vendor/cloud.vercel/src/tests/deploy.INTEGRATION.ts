import { VercelHttp } from '../node.VercelHttp';
import { nodefs, Http, rx, Filesystem } from '../test';
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

  it.only('deploy: paul', async () => {
    //
    const team = await getTeam();

    const dir = 'paul';
    const target = 'production';
    const project = team.project('family');
    // const project = team.project('tdb-dev');
    const regions = ['sfo1'];
    const alias = 'paul.db.team';

    const res = await project.deploy({ dir, target, regions, alias });

    console.log('-------------------------------------------');
    console.log('res', res);
    console.log('-------------------------------------------');
    console.log('source (dir):', dir);
  });

  // it.only('create project', async () => {
  //   const team = await getTeam();
  //   const res = await team.project('family').create();
  //   console.log('res', res);
  // });
});
