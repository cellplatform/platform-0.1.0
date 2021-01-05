import { exec, fs, ProgressSpinner, slug, t, Package } from '../../common';
import { TscManifest } from './TscManifest';

/**
 * Wrapper for running the `tsc` typescript compiler
 * with a programmatic API.
 *
 * NOTE:
 *    Uses [exec] child_process under the hood.
 *
 */
export function TscTranspiler(tsconfig: t.TscConfig): t.TscTranspile {
  return async (args) => {
    const outdir = fs.resolve(args.outdir);
    const spinner = ProgressSpinner({ label: args.spinnerLabel || 'building typescript' });

    // Prepare [tsconfig].
    const json = await tsconfig.json();
    json.compilerOptions = { ...(json.compilerOptions || {}), ...args.compilerOptions };
    json.compilerOptions.outDir = outdir;
    if (args.source) {
      json.include = Array.isArray(args.source) ? args.source : [args.source];
    }

    // Save the transient [tsconfig] file.
    const dir = fs.dirname(tsconfig.path);
    const path = fs.join(dir, `tsconfig.tmp.${slug()}`);
    await fs.writeFile(path, JSON.stringify(json, null, '  '));

    // Run the command.
    if (!args.silent) spinner.start();
    let error: string | undefined;
    const cmd = exec.command(`tsc --project ${path}`);
    const cwd = fs.dirname(path);
    const res = await cmd.run({ cwd, silent: true });
    if (!res.ok) {
      const emitted = res.errors.map((err) => err).join('\n');
      error = `Failed to transpile typescript. ${emitted}`.trim();
    }

    // Copy [package.json].
    const packagePath = await findPackagePath(json.include);
    if (packagePath) {
      await fs.copy(packagePath, fs.join(outdir, 'package.json'));
    }

    const transformations: t.TscPathTransform[] = [];
    if (args.outdir) {
      const transform = (from: string) => {
        if (typeof args.transformPath !== 'function') return from;
        const to = args.transformPath(from);
        if (typeof to === 'string' && to !== from) {
          transformations.push({ from, to });
          return to;
        } else {
          return from;
        }
      };

      const paths = await fs.glob.find(`${outdir}/**/*`);
      await Promise.all(paths.map(transform));
      await Promise.all(transformations.map(({ from, to }) => fs.rename(from, to)));
    }

    // Save the type-declaration manifest.
    const { manifest } = await TscManifest.generate({ dir: outdir });

    // Clean up.
    await fs.remove(path);
    spinner.stop();

    // Finish up.
    return {
      tsconfig: json,
      out: { dir: outdir, manifest },
      transformations,
      error,
    };
  };
}

/**
 * [Helpers]
 */

async function findPackagePath(include: string[]) {
  const paths = (await Promise.all(include.map((pattern) => fs.glob.find(pattern)))).flat(1);
  for (const path of paths) {
    const res = await Package.findClosestPath(fs.dirname(path));
    if (res) return res.path;
  }
  return '';
}
