import { Command, t } from '../components/common';

type P = t.ITestCommandProps;

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('root')
  //
  .add('install', async e => {
    const { npm } = e.props;
    const { params } = e.args;
    console.log('e.props', e.props);
    console.log('e.args', e.args);

    const name = (params[0] || '').toString();
    const version = (params[1] || '').toString();

    if (name) {
      await npm.install({ name, version });
    }

    // const res = await npm.getInfo('@platform/npm');
    // console.log('res', res);

    // const dir = `${remote.app.getPath('desktop')}/tmp-app`;

    // console.log('dir', dir);
    // console.log('fs', fs);

    // await fs.ensureDir(dir);

    // const cmd = exec
    //   .command()
    //   .add(`cd ${dir}`)
    //   .add(`&&`)
    //   .add(`npm install @platform/libs`);

    // console.log('cmd.toString', cmd.toString());
    // const res = await cmd.run();
    // console.log('-------------------------------------------');
    // console.log('res', res);
  });
