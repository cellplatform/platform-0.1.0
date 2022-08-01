import { log, Model, t, Encoding, defaultValue, time, fs, DEFAULT, R } from '../common';
import { stats } from '../Config.webpack';
import { Format } from './util.format';

/**
 * Log helpers for common logging output.
 */
export const Logger = {
  format: Format,

  clear() {
    log.clear();
    return Logger;
  },

  newline(length = 1) {
    Array.from({ length }).forEach(() => log.info());
    return Logger;
  },

  hr(length = 60) {
    log.info.gray('━'.repeat(length));
    return Logger;
  },

  async stats(input?: t.WpStats | t.WpCompilation) {
    const info = stats(input);
    const dir = info.output.path;
    const elapsed = info.elapsed;
    await Logger.bundle({ dir, elapsed });
    Logger.errors(info.errors);
  },

  async bundle(args: { dir: string; elapsed?: number }) {
    const bundleDir = args.dir;
    const stripRoot = (path: string) => {
      const root = fs.resolve('.');
      return path.startsWith(root) ? path.substring(root.length) : path;
    };

    const elapsed = args.elapsed ? time.duration(args.elapsed).toString() : '-';
    const table = log.table({ border: false });
    const indent = ' '.repeat(2);

    type T = { path: string; bytes: number };
    const wait = (await fs.glob.find(fs.join(bundleDir, '**'))).map(async (path) => {
      const bytes = (await fs.size.file(path)).bytes;
      path = path.substring(bundleDir.length + 1);
      return { path, bytes };
    });

    const items = (await Promise.all(wait)) as T[];
    const totalBytes = items.reduce((acc, next) => acc + next.bytes, 0);
    const totalSize = fs.size.toString(totalBytes);

    const toSizeColor = (bytes: number) => {
      const size = fs.size.toString(bytes);
      const KB = 1000;
      if (bytes > 1000 * KB) return log.red(size);
      if (bytes > 500 * KB) return log.yellow(size);
      if (bytes < 100 * KB) return log.green(size);
      return log.gray(size);
    };

    const addFile = (item: T) => {
      const extIndex = item.path.lastIndexOf('.');
      const ext = item.path.substring(extIndex);
      const path = item.path.substring(0, extIndex);
      const filename = log.gray(`${indent}• ${log.white(path)}${ext}`);
      table.add([filename, '    ', toSizeColor(item.bytes)]);
    };

    const cells = items.filter((item) => item.path.startsWith('cell-'));
    const dirs = items.filter((item) => item.path.includes('/'));
    const files = items.filter(
      (item) =>
        !cells.some((cell) => cell.path === item.path) &&
        !dirs.some((dir) => dir.path === item.path),
    );

    files.forEach(addFile);
    cells.forEach(addFile);

    const toRootDir = (path: string) => path.substring(0, path.indexOf('/'));
    const dirGroups = R.groupBy((dir) => toRootDir(dir.path), dirs);

    Object.keys(dirGroups).forEach((key) => {
      const items = dirGroups[key];
      const bytes = items.reduce((acc, next) => acc + next.bytes, 0);
      const dirname = log.gray(`${indent}• ${key}/... (${items.length} files)`);
      table.add([dirname, '    ', toSizeColor(bytes)]);
    });

    table.add(['', '', log.white('-'.repeat(totalSize.length))]);
    table.add(['', '', log.white(totalSize)]);

    log.info();
    log.info.gray('Files');
    log.info.gray(`  ${stripRoot(bundleDir)}`);
    table.log();
    log.info.gray(`Bundled in ${log.yellow(elapsed)}`);
    log.info.gray(`Time:      ${time.now.format('h:mma (MMM) D-MM-YYYY')} (${time.timezone})`);
    log.info.gray(`Manifest:  ${fs.join(stripRoot(bundleDir), DEFAULT.FILE.JSON.MANIFEST)}`);
    log.info();
  },

  model(
    input: t.CompilerModel,
    options: { indent?: number; url?: string | boolean; port?: number } = {},
  ) {
    const { indent } = options;
    const { white, cyan, gray } = log;
    const prefix = typeof indent === 'number' ? ' '.repeat(indent) : '';
    const model = Model(input);
    const obj = model.toObject();
    const port = defaultValue(options.port, model.port());

    const green = (value?: any) => (value === undefined ? undefined : log.green(value));

    const table = log.table({ border: false });
    const add = (key: string, value: string | undefined) => {
      if (value) {
        const left = log.gray(`${prefix}${key} `);
        table.add([left, value]);
      }
    };

    const name = obj.title ? `${model.name()}/${obj.title}` : model.name();

    add('version', obj.version ? white(obj.version) : log.gray('0.0.0'));
    add('namespace', green(obj.namespace));
    add('config', gray(name));
    add('mode', gray(model.mode()));
    add('target', gray(model.target()));

    if (options.url) {
      let url = typeof options.url === 'string' ? options.url : 'http://localhost';
      url = port === 80 ? url : `${url}:${log.white(port)}`;
      add('url', cyan(url));
      add('', `${cyan(url)}${gray('?dev')}`);
    }

    table.log();
    return Logger;
  },

  exports(model: t.CompilerModel, options: { title?: string; disabled?: boolean } = {}) {
    if (model.exposes) {
      const { disabled } = options;
      const title = options.title ? options.title : disabled ? 'Exports (disabled)' : 'Exports';
      const exposes = Encoding.transformKeys(model.exposes, Encoding.unescapePath);
      log.info.gray(title);
      Object.keys(exposes).forEach((path) => {
        log.info.gray(`  ${Format.filepath(path)}`);
      });
    }
    return Logger;
  },

  variants(model: t.CompilerModel, options: { title?: string } = {}) {
    const variants = model.variants || [];
    if (variants.length > 0) {
      const { title = 'Build variants' } = options;
      log.info();
      log.info.gray(title);
      model.variants?.forEach((name) => {
        log.info.gray(` • ${log.white(name)}`);
      });
    }
    return Logger;
  },

  errors(list: { message: string }[]) {
    list.forEach((err, i) => {
      log.info.gray(`${log.red('ERROR')} ${log.yellow(i + 1)} of ${list.length}`);
      log.info(err.message);
      log.info();
    });
    return Logger;
  },
};
