import { Command, t } from '../common';
import { remote } from 'electron';

// import { fs } from '@platform/fs';

type P = t.ITestCommandProps;

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('root')
  //
  .add('tmp', async e => {
    console.log('e.props', e.props);

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
