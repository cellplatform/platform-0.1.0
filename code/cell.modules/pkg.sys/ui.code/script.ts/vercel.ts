import { fs } from '@platform/fs';
import { Vercel, t, log } from 'vendor.cloud.vercel/lib/node';
import { PATH } from '../src/common/constants';

const token = process.env.VERCEL_TEST_TOKEN || '';

export async function deploy(team: string, project: string, alias: string) {
  const silent = false;
  const dir = 'dist/web';

  await fs.copy('vercel.json', fs.join(dir, 'vercel.json'));
  await Vercel.ConfigFile.prepare({
    dir,
    modifyBeforeSave(e) {
      const { dir, config } = e;
      return modifyVercelFile({ dir, config, silent });
    },
  });

  const deployment = Vercel.Deploy({ token, dir, team, project });
  const info = await deployment.info();

  Vercel.Log.beforeDeploy({ info, alias, project });

  const res = await deployment.commit(
    { target: 'production', regions: ['sfo1'], alias },
    { ensureProject: true },
  );

  // Finish up.
  Vercel.Log.afterDeploy(res);
}

/**
 * [Helpers]
 */
async function getVsProxyRewrites(dir: string) {
  const pattern = fs.join(dir, PATH.STATIC.VS, '**');
  const paths = await fs.glob.find(pattern);

  return paths
    .map((path) => path.substring(dir.length))
    .map((path) => path.replace(/^\/*/, ''))
    .map(
      (destination): t.VercelConfigRewrite => ({
        source: `/:path*/${destination}`,
        destination,
      }),
    );
}

async function modifyVercelFile(args: {
  dir: string;
  config: t.VercelConfigFile;
  silent?: boolean;
}) {
  const { dir, config } = args;
  const rewrites = await getVsProxyRewrites(dir);

  if (!args.silent) {
    const match = `${log.white(`**/${PATH.STATIC.VS}/**`)}`;
    const action = `add proxy rewrites "${match}" for ${rewrites.length} files.`;
    log.info.gray(`(vercel.json) ${action}`);
  }

  return {
    ...config,
    rewrites: [...rewrites, ...(config.rewrites || [])],
  };
}
