import { http } from '@platform/http';
import { expect, fs } from '../test';
import { Vercel } from '../Vercel';
import * as util from './util';

describe.only('Vercel', function () {
  this.timeout(9999);

  const token = process.env.VERCEL_TEST_TOKEN ?? '';
  const client = Vercel({ token });

  describe('util', () => {
    it('toUrl', () => {
      expect(util.toUrl(12, '  teams  ')).to.eql('https://api.vercel.com/v12/teams');
      expect(util.toUrl(12, 'teams?123')).to.eql('https://api.vercel.com/v12/teams'); // NB: Strips query string.
    });

    it('toUrl: query', () => {
      type Q = Record<string, string | number>;

      const test = (query: Q, expected: string) => {
        const res = util.toUrl(12, 'projects', query);
        expect(res).to.eql(`${'https://api.vercel.com/v12/projects'}${expected}`);
      };

      test({}, '');
      test({ teamId: 'foo' }, '?teamId=foo');
      test({ teamId: 'foo', foo: 123 }, '?teamId=foo&foo=123');
    });
  });

  describe('[INTEGRATION] teams', () => {
    it('teams.list', async () => {
      const res = await client.teams.list();
      console.log('teams:', res);
    });
  });

  describe.only('[INTEGRATION] team', () => {
    const getTeamId = async (index?: number) => {
      const teams = (await client.teams.list()).teams;
      return teams[index ?? 1].id;
    };

    const getTeam = async (index?: number) => {
      return client.team(await getTeamId(index));
    };

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

    it.only('team.deploy', async () => {
      /**
       * Forum/Question:
       *    calculating `x-now-digest` SHA1 hash #6499
       *    https://github.com/vercel/vercel/discussions/6499
       */

      const dir = fs.resolve('dist/web');
      // const dir = fs.resolve('../../pkg.sys/net/dist/web');

      const team = await getTeam();
      const name = 'test';
      const meta = { foo: 'hello' };
      const routes = [{ src: '/foo', dest: '/child' }];
      const target = 'production';

      const project = team.project('tmp');

      const res = await project.deploy({ name, dir: dir, target, meta, routes });

      console.log('-------------------------------------------');
      console.log('res', res);
      console.log('-------------------------------------------');
      console.log('source dir:', dir);
    });
  });
});
