import { Stats as IStats } from 'webpack';

import { log, t, Model, fs, logger, Schema, DEFAULT, value } from '../common';
import { wp, afterCompile } from './util';

/**
 * Bundle the project.
 */
export const bundle: t.CompilerRunBundle = (input, options = {}) => {
  return new Promise<t.WebpackBundleResponse>((resolve, reject) => {
    const { silent } = options;
    const { compiler, model, config } = wp.toCompiler(input);

    if (!silent) {
      log.info();
      log.info.gray(`Bundling`);
      logger.model(model, { indent: 2, url: false }).newline().hr();
    }

    compiler.run(async (err, stats) => {
      if (err) {
        return reject(err);
      }
      if (stats) {
        const res = toBundledResponse({ model, stats, config });
        const dir = res.dir;
        const compilation = stats.compilation;

        await copyStatic({ model, dir });
        await saveBundleManifest({ model, dir });
        afterCompile({ model, compilation, webpack: config });

        if (!silent) {
          logger.newline().stats(stats);
        }

        resolve(res);
      } else {
        reject(new Error(`The compilation did not produce a stats object.`));
      }
    });
  });
};

/**
 * [Helpers]
 */

function toBundledResponse(args: {
  model: t.CompilerModel;
  stats: IStats;
  config: t.WpConfig;
}): t.WebpackBundleResponse {
  const { model, config } = args;
  const stats = wp.stats(args.stats);
  return {
    ok: stats.ok,
    elapsed: stats.elapsed,
    dir: stats.output.path,
    stats,
    model,
    config,
    toString: () => args.stats.toString({ colors: true }),
  };
}

async function copyStatic(args: { model: t.CompilerModel; dir: string }) {
  const model = Model(args.model);
  const staticDirs = model
    .static()
    .map(({ dir }) => dir as string)
    .filter(Boolean);

  await Promise.all(
    staticDirs.map(async (from) => {
      const to = fs.join(args.dir, fs.basename(from));
      await fs.copy(from, to);
    }),
  );

  return staticDirs;
}

async function createBundleManifest(args: {
  model: t.CompilerModel;
  dir: string;
}): Promise<t.BundleManifest> {
  const REMOTE = DEFAULT.FILE.JS.REMOTE_ENTRY;
  const model = Model(args.model);
  const paths = await fs.glob.find(`${args.dir}/**`, { includeDirs: false });

  const files: t.BundleManifestFile[] = await Promise.all(
    paths.map(async (path) => {
      const file = await fs.readFile(path);
      const bytes = file.byteLength;
      const filehash = Schema.hash.sha256(file);
      path = path.substring(args.dir.length + 1);
      return { path, bytes, filehash };
    }),
  );

  const bytes = files.reduce((acc, next) => acc + next.bytes, 0);
  const hash = Schema.hash.sha256(files.map((file) => file.filehash));

  return value.deleteUndefined({
    hash,
    mode: model.mode(),
    target: model.target(),
    entry: model.entryFile,
    remoteEntry: paths.some((path) => path.endsWith(REMOTE)) ? REMOTE : undefined,
    bytes,
    files,
  });
}

async function saveBundleManifest(args: {
  model: t.CompilerModel;
  dir: string;
  filename?: string;
}): Promise<t.BundleManifest> {
  const { model, dir, filename = DEFAULT.FILE.JSON.INDEX } = args;
  const manifest = await createBundleManifest({ model, dir });
  const json = JSON.stringify(manifest, null, '  ');
  await fs.writeFile(fs.join(dir, filename), json);
  return manifest;
}
