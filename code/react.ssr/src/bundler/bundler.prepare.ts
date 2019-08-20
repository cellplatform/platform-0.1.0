import * as ReactDOMServer from 'react-dom/server';
import { util, constants, fs, jsYaml, t, time, log } from '../common';

const renderStatic = require('glamor/server').renderStatic;

/**
 * Prepares a bundle for publishing.
 */
export async function prepare(args: {
  bundleDir: string;
  entries?: t.IBundleEntryElement[];
  silent?: boolean;
}) {
  const { entries } = args;

  const dir = fs.resolve(args.bundleDir);
  if (!(await fs.pathExists(dir))) {
    throw new Error(`Cannot prepare, the directory does not exist. ${dir}`);
  }

  // Write a YAML file describing the contents of the bundle.
  const path = fs.join(dir, constants.PATH.BUNDLE_MANIFEST);
  const manifest = await bundleManifest.write({ path, entries });
  const dirSize = await fs.size.dir(dir);

  const write = () => {
    log.info();
    log.info.cyan(`Preparing bundle 👌`);
    log.info();
    log.info.gray(`  size:  ${log.magenta(dirSize.toString())}`);
    log.info.gray(`  dir:   ${util.formatPath(dir)}`);
    log.info();
    manifest.files.forEach(file => {
      let name = file;
      name = name.endsWith('.js') ? log.yellow(name) : name;
      name = name.endsWith('.html') ? log.green(name) : name;
      const fileSize = dirSize.files.find(item => item.path.endsWith(`/${file}`));
      let size = fileSize ? fileSize.toString({ round: 0, spacer: '' }) : '';
      size = `${size}        `.substring(0, 8);
      log.info.gray(`         - ${size} ${name}`);
    });
    log.info();
  };

  if (!args.silent) {
    write();
  }

  // Finish up.
  return { manifest, write };
}

/**
 * Create a bundle manifest for the given path.
 */
const bundleManifest = {
  async create(args: { path: string; entries?: t.IBundleEntryElement[] }) {
    const dir = fs.dirname(args.path);
    const version = fs.basename(dir);
    const size = await fs.size.dir(dir);

    let files = await fs.glob.find(fs.join(dir, '**'));
    files = files.map(path => path.substring(dir.length + 1));

    const entries = (args.entries || [])
      .filter(entry => files.includes(entry.file))
      .map(entry => renderEntry(entry));

    const manifest: t.IBundleManifest = {
      version,
      createdAt: time.now.timestamp,
      bytes: size.bytes,
      size: size.toString(),
      files,
      entries,
    };
    return manifest;
  },

  /**
   * Create and write a bundle manifest to disk.
   */
  async write(args: { path: string; entries?: t.IBundleEntryElement[] }) {
    const manifest = await bundleManifest.create(args);
    const yaml = jsYaml.safeDump(manifest);
    await fs.writeFile(args.path, yaml);
    return manifest;
  },
};

/**
 * [Helpers]
 */
function renderEntry(args: t.IBundleEntryElement): t.IBundleEntryHtml {
  const { id = 'root', file } = args;
  const { html, css } = renderStatic(() => ReactDOMServer.renderToString(args.el));
  return { file, id, html, css };
}

