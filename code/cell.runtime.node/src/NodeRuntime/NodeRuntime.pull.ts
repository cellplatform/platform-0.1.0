import { BundleWrapper as BundleWrapper } from '../BundleWrapper';
import { fs, log, Logger, Path, slug, t } from '../common';
import { downloadFiles } from './NodeRuntime.pull.download';

/**
 * Factory for the [pull] method.
 */
export function pullMethodFactory(args: { cachedir: string; isDisposed: () => boolean }) {
  const { cachedir, isDisposed } = args;

  /**
   * Pull the given bundle.
   */
  const fn: t.RuntimeEnvNode['pull'] = async (manifestUrl, options = {}) => {
    if (isDisposed()) throw new Error('Runtime disposed');

    const { silent } = options;
    const bundle = BundleWrapper(manifestUrl, cachedir);
    const targetDir = bundle.cache.dir;
    const tmpTarget = `${targetDir}.download.${slug()}`;

    if (!silent) {
      const from = manifestUrl;
      const to = Path.trimBase(targetDir);
      const table = log.table({ border: false });

      const add = (key: string, value: string) => {
        table.add([log.gray(` • ${log.white(key)}`), log.gray(value)]);
      };
      add('from ', from);
      add('to', to);

      log.info();
      log.info.gray(`pulling bundle`);
      table.log();
      log.info();
    }

    // Download the manifest files.
    const res = await downloadFiles(bundle.url.href, tmpTarget);
    const ok = res.ok;
    const count = res.total.downloaded;
    const errors = res.errors;

    // Switch the target directory to the downloaded result-set.
    if (res.ok) {
      await fs.remove(targetDir);
      await fs.ensureDir(fs.dirname(targetDir));
      await fs.rename(tmpTarget, targetDir);
    }

    // Clean up on error.
    if (!res.ok) {
      await fs.remove(tmpTarget);
    }

    // Finish up.
    if (!silent) {
      const bytes = (await fs.size.dir(targetDir)).toString({ round: 0 });
      const size = count > 0 ? `(${log.yellow(bytes)})` : '';
      log.info.gray(`${log.green(count)} files pulled ${size}`);
      Logger.errors(errors);
      Logger.hr().newline();
    }

    return {
      ok,
      dir: targetDir,
      bundle: { url: manifestUrl, manifest: res.manifest },
      errors,
    };
  };

  return fn;
}
