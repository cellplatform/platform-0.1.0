import { fs } from '@platform/fs';

type VercelRewrite = { source: string; destination: string };
type Vercel = { rewrites?: VercelRewrite[] };

/**
 * Helpers for working with the [vercel.json] file.
 *
 * Ref:
 *    https://vercel.com/docs/project-configuration
 *
 */
export const VercelConfigFile = {
  /**
   * Insert a set of redirects for each .js file in the bundle, ensuring they will be
   * rendered from any deep path from the root of the Vercel deployment.
   *
   * Ref:
   *    https://vercel.com/docs/project-configuration#project-configuration/rewrites
   *
   * HACK:
   *    Note that this is a hack being employed until an adequate regex source/destination
   *    pattern can be figured out that does this automatically.
   *
   */
  async prepareRewrites(args: { dir: string }) {
    // Prepare paths.
    const dir = fs.resolve(args.dir);
    const filepath = fs.join(dir, 'vercel.json');
    if (!(await fs.pathExists(filepath))) await fs.writeJson(filepath, {});

    // Load the base [vercel.json] file.
    const vercel = (await fs.readJson(filepath)) as Vercel;
    if (!vercel.rewrites) vercel.rewrites = [];

    // Prepare the routes.
    const filenames = (await fs.readdir(dir)).filter((filename) => filename.endsWith('.js'));
    const rewrites: VercelRewrite[] = filenames.map((filename) => ({
      source: `/:path*/${filename}`,
      destination: `/${filename}`,
    }));

    // Write to the [vercel.json] files.
    // NOTE:
    //    Place before all other rewrites to ensure the direct file names
    //    get caught before any more generalized route-pattern matching occurs.
    vercel.rewrites = [...rewrites, ...vercel.rewrites];
    await fs.writeFile(filepath, JSON.stringify(vercel, null, '  '));
  },
};
