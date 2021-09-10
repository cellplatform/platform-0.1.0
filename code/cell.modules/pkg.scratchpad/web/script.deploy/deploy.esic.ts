// import { Test } from 'sys.ui.dev';
import { Vercel, Filesystem, rx, nodefs } from './common';
// import { part } from './common';

const bus = rx.bus();
const store = Filesystem.Controller({ bus, fs: nodefs.resolve('dist') });
const fs = store.fs();

const token = process.env.VERCEL_TEST_TOKEN ?? '';
const client = Vercel.Http({ fs, token });

const getTeam = async (name: string) => {
  const teams = (await client.teams.list()).teams;
  const team = teams.find((team) => team.name === name);
  if (!team) throw new Error(`Cannot find team named '${name}'`);
  return client.team(team.id);
};

const Project = {
  /**
   * Deploy the project
   */
  async deploy() {
    const team = await getTeam('tdb');
    const source = await Vercel.Fs.readdir(fs, 'web');

    // console.log('source', source);
    // console.log('t', team);

    const project = team.project('slc-dev');
    const target = 'production';
    const regions = ['sfo1'];
    const alias = 'esic.dev.socialleancanvas.com';
    const res = await project.deploy({
      source,
      target,
      regions,
      alias,
      name: 'esic-workshops-v2.0.0',
    });

    console.log('-------------------------------------------');
    console.log('res', res.deployment);
    console.log('-------------------------------------------');
    // console.log('res.urls', res.urls);
    console.log(`https://${alias}`);
  },
};

/**
 * Run
 */
(async () => {
  await Project.deploy();
  // console.log('deploy tmp');
})();
