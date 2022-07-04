import { BusController, BusEvents } from '.';
import { nodefs, rx, t } from '../test';
import { VercelHttp } from '../Vercel.Http';
import { Filesystem } from './common';

describe.skip('BusController', function () {
  const timeout = 90000;
  this.timeout(timeout);

  const bus = rx.bus<t.VercelEvent>();
  const instance = { bus };
  const store = Filesystem.Controller({ bus, driver: nodefs.resolve('static.test') });
  const fs = store.fs();

  const token = process.env.VERCEL_TEST_TOKEN || '';
  const client = VercelHttp({ fs, token }); // TEMP

  const getTeamId = async (index?: number) => {
    const teams = (await client.teams.list()).teams;
    return teams[index ?? 1].id;
  };

  const getTeam = async (index?: number) => {
    return client.team(await getTeamId(index));
  };

  describe('Deploy', () => {
    it('bundle (Uint8Array)', async () => {
      const dir = fs.dir('web');

      const controller = BusController({ instance, token, fs });
      const events = BusEvents({ instance });

      // const paths = manifest.files.map((file) => file.path);

      const manifest = await dir.manifest();
      const wait = manifest.files.map(async ({ path }) => ({ path, data: await dir.read(path) }));
      const files: t.VercelFile[] = await Promise.all(wait);
      const source: t.VercelSourceBundle = { files, manifest };

      const res = await events.deploy.fire({
        source,
        team: 'tdb',
        project: 'tmp',
        target: 'staging',
        regions: ['sfo1'],
        name: 'foobar',
        timeout: timeout - 1000,
      });

      console.log('-------------------------------------------');
      console.log('res', res);
    });
  });
});
