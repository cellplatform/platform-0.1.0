import { fs } from '@platform/fs';
import { Vercel, t, log } from 'vendor.cloud.vercel/lib/node';

const token = process.env.VERCEL_TEST_TOKEN || '';

export async function deploy(team: string, project: string, alias: string) {
  const silent = false;
  const dir = 'dist/web';

  await fs.copy('vercel.json', fs.join(dir, 'vercel.json'));
  await Vercel.ConfigFile.prepare({
    dir,
    async modifyBeforeSave(e) {
      const rewrites = await getVsProxyRewrites(e.dir);

      if (!silent) {
        const match = `${log.white('**/static/vs/**')}`;
        const action = `add proxy rewrites "${match}" for ${rewrites.length} files.`;
        log.info.gray(`(vercel.json) ${action}`);
      }

      return {
        ...e.config,
        rewrites: [...rewrites, ...(e.config.rewrites || [])],
      };
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
  const pattern = fs.join(dir, '/static/vs/**');
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
